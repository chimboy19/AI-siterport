const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { VertexAI } = require("@google-cloud/vertexai");

exports.generateAIReport = onCall({ 
  maxInstances: 10,
  memory: "1GiB"
}, async (request) => {
 
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { projectTitle, reportTitle, reportDate, engineerName, images, lang = "en" } = request.data;

  if (!projectTitle || !reportTitle || !images) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  try {
    const vertexAI = new VertexAI({ 
      project: "ai-sermon-d40ed", 
      location: "us-east4" 
    });

    const model = vertexAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    const systemInstruction = `
      You are an expert construction site engineer. 
      Generate a professional, structured daily site report based on the provided images and notes.
      
      The report MUST start with this exact header format (well-arranged):
      
      **Project:** [Project Title]
      **Report Title:** [Report Title]
      **Date:** [Report Date]
      **Site Engineer:** [Engineer Name]
      
      ---
      
      Followed by:
      1. **Summary of Work Completed**: Based on the images and notes.
      2. **Current Activities**: What is happening on site right now.
      3. **Issues / Risks**: Any potential problems or safety concerns visible or mentioned.
      4. **Materials / Equipment**: Any materials or equipment seen in the images.
      5. **Progress Estimate**: An estimated percentage of progress for the tasks shown.
      
      Format the output in clean Markdown. Use headings, bullet points, and bold text for readability.
      Be professional, concise, and accurate.
      
      IMPORTANT: You must write the entire report in ${lang === 'jp' ? 'Japanese (日本語)' : 'English'}.
    `;

    const prompt = `
      Project: ${projectTitle}
      Report Title: ${reportTitle}
      Date: ${reportDate}
      Site Engineer: ${engineerName || "Site Engineer"}
      
      Please analyze the attached images and their corresponding notes to generate the daily site report in ${lang === 'jp' ? 'Japanese (日本語)' : 'English'}.
    `;

    // Process image parts
    const imageParts = images.map((img, index) => {
      return [
        {
          inlineData: {
            mimeType: img.mimeType || "image/jpeg",
            data: img.data,
          },
        },
        {
          text: `Image ${index + 1} Note: ${img.note || "No note provided."}`,
        }
      ];
    }).flat();

    const generateContentRequest = {
      contents: [
        { role: "user", parts: [{ text: systemInstruction }, { text: prompt }, ...imageParts] }
      ],
    };

    const result = await model.generateContent(generateContentRequest);
    const response = await result.response;
    
    const text = response.candidates[0].content.parts[0].text;
    
    return { text: text || "Failed to generate report text." };

  } catch (error) {
    logger.error("Vertex AI Detailed Error:", {
      message: error.message,
      stack: error.stack,
      details: error.details
    });
    throw new HttpsError("internal", `AI Generation Failure: ${error.message || "Unknown Error"}`);
  }
});
