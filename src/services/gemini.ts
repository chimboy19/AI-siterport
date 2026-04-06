import { httpsCallable } from "firebase/functions";
import { functions, storage } from "../firebase";
import { ref, getBlob, getBytes } from "firebase/storage";
import type { SiteImage } from "../types";

export async function generateSiteReport(
  projectTitle: string,
  reportTitle: string,
  reportDate: string,
  engineerName: string,
  images: SiteImage[],
  lang: string = "en"
): Promise<string> {
  console.log(`Calling server-side AI report generation for ${projectTitle}. Lang: ${lang}`);

  const processedImages = await Promise.all(
    images.map(async (img, index) => {
      try {
        let base64: string | null = img.localData || null;
        let mimeType: string = "image/jpeg";
        
        if (base64 && base64.startsWith("data:")) {
          const match = base64.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64 = match[2];
          }
        }

        if (!base64) {
          try {
            const storageRef = ref(storage, img.path || img.url);
            let blob: Blob;
            try {
              const bytes = await getBytes(storageRef);
              blob = new Blob([bytes]);
            } catch (byteError) {
              blob = await getBlob(storageRef);
            }
            
            mimeType = blob.type || "image/jpeg";
            base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (error) {
            console.error(`Failed to load storage image ${index}:`, error);
            return null;
          }
        }

        return {
          data: base64,
          mimeType: mimeType,
          note: img.note || ""
        };
      } catch (error) {
        console.error(`Error processing image ${index}:`, error);
        return null;
      }
    })
  );

  const finalImages = processedImages.filter((img): img is NonNullable<typeof img> => img !== null);

  if (finalImages.length === 0) {
    throw new Error("No images could be prepared for the AI.");
  }

  // 2. Call the Cloud Function
  const generateAI = httpsCallable<{
    projectTitle: string;
    reportTitle: string;
    reportDate: string;
    engineerName: string;
    images: { data: string; mimeType: string; note: string }[];
    lang: string;
  }, { text: string }>(functions, "generateAIReport");

  try {
    const result = await generateAI({
      projectTitle,
      reportTitle,
      reportDate,
      engineerName,
      images: finalImages,
      lang
    });

    return result.data.text || "Failed to generate report text.";
  } catch (error: any) {
    console.error("Cloud Function Error:", error);
    throw new Error(error.message || "An error occurred while calling the AI service.");
  }
}
