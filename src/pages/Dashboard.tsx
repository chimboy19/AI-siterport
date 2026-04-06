
import { useState,  useMemo } from 'react';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth, db } from '../firebase';
// import { Project, Report } from '../types';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Calendar, ChevronRight, FileText, BarChart3, Clock, Image as ImageIcon, Trash2, Edit3, ArrowRight, Search, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { ja, enUS } from 'date-fns/locale';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase'
import { useCreateProject, useUserProject, useDeleteProject, useUpdateProject } from '../hooks/UseProject';
import { useUserReports } from '../hooks/UseReport';
import { useUserUsage } from '../hooks/UseUsage';
import type { Report, Project } from '../types';

const translations = {
  en: {
    overview: "Overview",
    dashboard: "DASHBOARD.",
    welcome: "Welcome back,",
    manage: "Manage your site documentation and AI-generated reports.",
    newProject: "New Project",
    totalProjects: "Total Projects",
    aiReports: "AI Reports",
    imagesAnalyzed: "Images Analyzed",
    activeProjects: "ACTIVE PROJECTS",
    recentReports: "RECENT REPORTS",
    noProjects: "NO PROJECTS YET.",
    noProjectsDesc: "Create your first project to start generating professional site reports.",
    createProject: "Create Project",
    noReports: "No reports generated yet.",
    generateReport: "GENERATE REPORT.",
    generateReportDesc: "Select a project to upload site images and generate an AI-powered report instantly.",
    getStarted: "Get Started",
    newProjectTitle: "NEW PROJECT.",
    editProjectTitle: "EDIT PROJECT.",
    projectName: "Project Name",
    projectDesc: "Description (Optional)",
    scopePlaceholder: "Briefly describe the project scope...",
    namePlaceholder: "e.g., Downtown Plaza Renovation",
    cancel: "Cancel",
    create: "Create",
    creating: "Creating...",
    save: "Save",
    saving: "Saving...",
    deleteConfirm: "Are you sure you want to delete this project? All associated reports will also be deleted.",
    deleteFailed: "Failed to delete project.",
    justNow: "Just now",
    searchPlaceholder: "Search projects or reports...",
    viewAll: "View All",
    trialStatus: "Trial Status",
    reportsLeft: "Reports Remaining",
    reportsUsed: "AI Reports Used",
    allUsed: "Limit Reached"
  },
  jp: {
    overview: "概要",
    dashboard: "ダッシュボード",
    welcome: "おかえりなさい、",
    manage: "現場ドキュメントとAI生成レポートを管理します。",
    newProject: "新規プロジェクト",
    totalProjects: "総プロジェクト数",
    aiReports: "AIレポート",
    imagesAnalyzed: "分析済み画像",
    activeProjects: "進行中のプロジェクト",
    recentReports: "最近のレポート",
    noProjects: "プロジェクトがありません。",
    noProjectsDesc: "最初のプロジェクトを作成して、プロフェッショナルな現場レポートの生成を開始しましょう。",
    createProject: "プロジェクト作成",
    noReports: "レポートはまだ生成されていません。",
    createReport: "レポート生成",
    generateReport: "レポート生成",
    generateReportDesc: "プロジェクトを選択して現場画像をアップロードし、AIパワーのレポートを即座に生成します。",
    getStarted: "開始する",
    newProjectTitle: "新規プロジェクト",
    editProjectTitle: "プロジェクト編集",
    projectName: "プロジェクト名",
    projectDesc: "説明（任意）",
    scopePlaceholder: "プロジェクトの範囲を簡単に説明してください...",
    namePlaceholder: "例：丸の内プラザ改修工事",
    cancel: "キャンセル",
    create: "作成",
    creating: "作成中...",
    save: "保存",
    saving: "保存中...",
    deleteConfirm: "このプロジェクトを削除してもよろしいですか？関連するすべてのレポートも削除されます。",
    deleteFailed: "プロジェクトの削除に失敗しました。",
    justNow: "たった今",
    searchPlaceholder: "プロジェクトやレポートを検索...",
    viewAll: "すべて表示",
    trialStatus: "トライアル状況",
    reportsLeft: "残りレポート数",
    reportsUsed: "使用済みレポート",
    allUsed: "制限に達しました"
  }
};


const Dashboard = () => {
  const { lang = "en" } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === "jp" ? ja : enUS;

   const [user] = useAuthState(auth)
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editingProject, setEditingProject] = useState<Project | null>(null);
   const [newProjectName, setNewProjectName] = useState("");
   const [newProjectDesc, setNewProjectDesc] = useState("");
   const [searchQuery, setSearchQuery] = useState("");

  //  const user = { displayName: "User" }; // mock user

  const { data: projects, isLoading: isProjectsLoading } = useUserProject(user?.uid)
  const { data: reports, isLoading: isReportsLoading } = useUserReports(user?.uid)
  const { data: userUsage, isLoading: isUsageLoading } = useUserUsage(user?.uid);
  const limit = userUsage?.limit || 4;
  
  const isLoading = isProjectsLoading || isReportsLoading || isUsageLoading;
  
  const { mutate: createproject, isPending: isCreating, } = useCreateProject()
  
  const { mutate: deleteproject, isPending: isdeleting } = useDeleteProject(lang, user?.uid || "")
  
  const { mutate: updateproject, isPending: isUpdating } = useUpdateProject(lang, user?.uid)
  


  const handleCreateProject = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!user) return
    createproject({
      userId: user.uid,
      name: newProjectName,
      desc:newProjectDesc

    }
      
    )
    setNewProjectName("")
    setNewProjectDesc("")
    setIsModalOpen(false)
  }

  const handleUpdateProject = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if(!editingProject) return
    updateproject({
      projectId: editingProject.id,
      data: {
        name: newProjectName,
        description: newProjectDesc
      }
    })
    setNewProjectName("")
    setNewProjectDesc("")
    setEditingProject(null)
    setIsEditModalOpen(false)
  }

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDesc(project.description || "");
    setIsEditModalOpen(true);
  };
  
  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    if (!user) {
      alert("User not authenticated");
      return;
    }

    deleteproject(projectId);
  };


   const stats = useMemo(() => {
     const totalImages = reports?.reduce((sum: number, r: Report) => sum + (r.images?.length || 0), 0) || 0;
     return [
       { label: t.totalProjects, value: projects?.length || 0, icon: Folder },
       { label: t.aiReports, value: reports?.length || 0, icon: FileText },
       { label: t.imagesAnalyzed, value: totalImages, icon: ImageIcon },
     ];
   }, [projects, reports, t]);

   const filteredProjects = useMemo(() => {
     if (!projects) return [];

     // Sort projects by activity (updatedAt || createdAt)
     const sorted = [...projects].sort((a, b) => {
       const timeA = a.updatedAt?.toMillis() || a.createdAt?.toMillis() || 0;
       const timeB = b.updatedAt?.toMillis() || b.createdAt?.toMillis() || 0;
       return timeB - timeA;
     });

     if (!searchQuery.trim()) return sorted.slice(0, 4);

     const query = searchQuery.toLowerCase();

     return sorted.filter(
       (project) =>
         project.name.toLowerCase().includes(query) ||
         project.description?.toLowerCase().includes(query),
     ).slice(0, 4);
   }, [projects, searchQuery]);
  
  

    const filteredReports = useMemo(() => {
     if (!reports) return [];
     if (!searchQuery.trim()) return reports.slice(0, 5);
     
     const query = searchQuery.toLowerCase();
     return reports.filter((r: Report) => 
       r.title.toLowerCase().includes(query)
     ).slice(0, 5);
   }, [reports, searchQuery]);
  
  
  
  
  if (isLoading) {
    return(
      <LoadingSpinner/>
    )
  }
  
  
   return (
     <div className="min-h-screen bg-white pb-12">
       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         {/* Welcome Header */}
         <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
             <span className="text-sm font-mono font-bold uppercase tracking-widest opacity-40 mb-2 block">
               {t.overview}
             </span>
             <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter">
               {t.dashboard}
             </h1>
             <p className="text-ink/60 mt-4 text-lg max-w-xl">
               {t.welcome}{" "}
               <span className="text-ink font-bold">
                 {user?.displayName || "User"}
               </span>
               .{t.manage}
             </p>

              {/* Trial Status Badge */}
              {!isUsageLoading && userUsage && (
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 border ${(userUsage?.count ?? 0) >= limit ? 'border-red-500 bg-red-50 text-red-700' : 'border-ink bg-ink/5 text-ink'} text-xs font-bold uppercase tracking-widest`}>
                    <Sparkles className={`h-3.5 w-3.5 ${(userUsage?.count ?? 0) >= limit ? 'text-red-600' : ''}`} />
                    <span>
                      {(userUsage?.count ?? 0) >= limit 
                        ? t.allUsed 
                        : `${limit - (userUsage?.count ?? 0)} ${t.reportsLeft}`
                      }
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-tighter opacity-40">
                    {userUsage?.count ?? 0} / {limit} {t.reportsUsed}
                  </div>
                </div>
              )}
            </div>
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/20 group-focus-within:text-ink transition-colors" />
               <input
                 type="text"
                 placeholder={t.searchPlaceholder}
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full sm:w-64 pl-12 pr-4 py-3 border border-line focus:border-ink outline-none transition-all font-medium"
               />
             </div>
             <button
               onClick={() => setIsModalOpen(true)}
               className="brutal-button flex items-center gap-2 w-fit"
             >
               <Plus className="h-5 w-5" />
               {t.newProject}
             </button>
           </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
           {stats.map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="border border-line p-8 flex flex-col gap-4 group hover:border-ink transition-colors"
             >
               <div className="h-12 w-12 bg-ink rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
                 <stat.icon className="h-6 w-6 text-white" />
               </div>
               <div>
                 <p className="text-sm font-mono font-bold uppercase tracking-widest opacity-40">
                   {stat.label}
                 </p>
                 <p className="text-4xl font-display font-bold mt-1">
                   {stat.value}
                 </p>
               </div>
             </motion.div>
           ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
           {/* Projects Column */}
           <div className="lg:col-span-8 space-y-10">
             <div className="flex items-center justify-between border-b border-line pb-4">
               <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                 <BarChart3 className="h-6 w-6" />
                 {t.activeProjects}
               </h2>
               <Link
                 to={`/${lang}/projects`}
                 className="text-sm font-bold uppercase tracking-tight text-ink/40 hover:text-ink transition-colors flex items-center gap-1 group"
               >
                 {t.viewAll}
                 <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
             </div>

             {filteredProjects.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {filteredProjects.map((project, i) => (
                   <motion.div
                     key={project.id}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.05 }}
                     className="group"
                   >
                     <Link
                       to={`/${lang}/project/${project.id}`}
                       className="flex border border-line p-8 hover:border-ink transition-all relative h-full flex flex-col"
                     >
                       <div className="flex items-start justify-between mb-6">
                         <div className="h-10 w-10 bg-line rounded-none flex items-center justify-center group-hover:bg-ink transition-colors">
                           <Folder className="h-5 w-5 text-ink group-hover:text-white transition-colors" />
                         </div>
                         <div className="flex items-center gap-1">
                           <button
                             onClick={(e) => openEditModal(project, e)}
                             className="p-2 text-ink/20 hover:text-ink transition-colors"
                             title="Edit Project"
                           >
                             <Edit3 className="h-4 w-4" />
                           </button>
                           <button
                             onClick={(e) => handleDeleteProject(project.id, e)}
                             disabled={isdeleting}
                             className="p-2 text-ink/20 hover:text-red-600 transition-colors"
                             title="Delete Project"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                       </div>

                       <h3 className="text-xl font-display font-bold mb-3 group-hover:underline underline-offset-4 decoration-2">
                         {project.name}
                       </h3>

                       {project.description && (
                         <p className="text-ink/60 text-sm line-clamp-2 mb-6 flex-grow">
                           {project.description}
                         </p>
                       )}

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-line">
                          <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest opacity-40">
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
                              <FileText className="h-3 w-3" />
                              <span>{(reports || []).filter((r: any) => r.projectId === project.id).length} {t.aiReports}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {project.createdAt
                                  ? format(
                                      project.createdAt.toDate(),
                                      "MMM d, yyyy",
                                      { locale: dateLocale },
                                    )
                                  : t.justNow}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                     </Link>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div className="border-2 border-dashed border-line p-16 flex flex-col items-center justify-center text-center">
                 <Folder className="h-12 w-12 text-line mb-6" />
                 <h3 className="text-xl font-display font-bold mb-2">
                   {t.noProjects}
                 </h3>
                 <p className="text-ink/40 text-sm max-w-xs mb-8">
                   {t.noProjectsDesc}
                 </p>
                 <button
                   onClick={() => setIsModalOpen(true)}
                   className="brutal-button"
                 >
                   {t.createProject}
                 </button>
               </div>
             )}
           </div>

           {/* Recent Activity Column */}
           <div className="lg:col-span-4 space-y-10">
             <h2 className="text-2xl font-display font-bold flex items-center gap-3 border-b border-line pb-4">
               <Clock className="h-6 w-6" />
               {t.recentReports}
             </h2>

             <div className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-ink/10 hover:scrollbar-thumb-ink/20 space-y-4">
               {filteredReports.length > 0 ? (
                 filteredReports.map((report: Report, i: number) => (
                   <motion.div
                     key={report.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                   >
                     <Link
                       to={`/${lang}/report/${report.id}`}
                       className="flex items-center gap-4 p-5 border border-line hover:border-ink transition-all group"
                     >
                       <div className="h-10 w-10 bg-line flex items-center justify-center group-hover:bg-ink transition-colors">
                         <FileText className="h-5 w-5 text-ink group-hover:text-white transition-colors" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate group-hover:underline">
                           {report.title}
                         </p>
                         <p className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-40 mt-1">
                           {format(new Date(report.date), "MMM d, yyyy", {
                             locale: dateLocale,
                           })}
                         </p>
                       </div>
                       <ChevronRight className="h-4 w-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                     </Link>
                   </motion.div>
                 ))
               ) : (
                 <div className="p-8 border border-line text-center">
                   <p className="text-sm text-ink/40 italic">{t.noReports}</p>
                 </div>
               )}
             </div>

             {/* Quick Action Card */}
             <div className="bg-ink p-8 text-white relative overflow-hidden">
               <div className="grid-pattern absolute inset-0 opacity-10" />
               <h3 className="font-display font-bold text-2xl mb-4 relative z-10">
                 {t.generateReport}
               </h3>
               <p className="text-white/60 text-sm mb-8 relative z-10 leading-relaxed">
                 {t.generateReportDesc}
               </p>
               <Link
                 to={`/${lang}/dashboard`}
                 onClick={(e) => {
                   if (!projects || projects.length === 0) {
                     e.preventDefault();
                     setIsModalOpen(true);
                   }
                 }}
                 className="brutal-button bg-white text-ink !shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:!shadow-none relative z-10"
               >
                 {t.getStarted}
               </Link>
             </div>
           </div>
         </div>
       </main>

       {/* Create Project Modal */}
       <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-md border border-ink shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10"
             >
               <h2 className="text-3xl font-display font-bold mb-8">
                 {t.newProjectTitle}
               </h2>
               <form
                 onSubmit={handleCreateProject} className="space-y-6">
                 <div>
                   <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                     {t.projectName}
                   </label>
                   <input
                     type="text"
                     required
                     value={newProjectName}
                     onChange={(e) => setNewProjectName(e.target.value)}
                     placeholder={t.namePlaceholder}
                     className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all font-medium"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                     {t.projectDesc}
                   </label>
                   <textarea
                     value={newProjectDesc}
                     onChange={(e) => setNewProjectDesc(e.target.value)}
                     placeholder={t.scopePlaceholder}
                     rows={3}
                     className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all resize-none font-medium"
                   />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 px-4 py-3 font-bold text-ink/40 hover:text-ink transition-colors"
                   >
                     {t.cancel}
                   </button>
                   <button
                     type="submit"
                     disabled={isCreating}
                     className="flex-1 brutal-button"
                   >
                     {isCreating ? t.creating : t.create}
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Edit Project Modal */}
       <AnimatePresence>
         {isEditModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => {
                 setIsEditModalOpen(false);
                 setEditingProject(null);
               }}
               className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-white w-full max-w-md border border-ink shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10"
             >
               <h2 className="text-3xl font-display font-bold mb-8">
                 {t.editProjectTitle}
               </h2>
               <form onSubmit={handleUpdateProject} className="space-y-6">
                 <div>
                   <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                     {t.projectName}
                   </label>
                   <input
                     type="text"
                     required
                     value={newProjectName}
                     onChange={(e) => setNewProjectName(e.target.value)}
                     placeholder={t.namePlaceholder}
                     className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all font-medium"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-mono font-bold uppercase tracking-widest mb-2">
                     {t.projectDesc}
                   </label>
                   <textarea
                     value={newProjectDesc}
                     onChange={(e) => setNewProjectDesc(e.target.value)}
                     placeholder={t.scopePlaceholder}
                     rows={3}
                     className="w-full px-4 py-3 border border-line focus:border-ink outline-none transition-all resize-none font-medium"
                   />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button
                     type="button"
                     onClick={() => {
                       setIsEditModalOpen(false);
                       setEditingProject(null);
                     }}
                     className="flex-1 px-4 py-3 font-bold text-ink/40 hover:text-ink transition-colors"
                   >
                     {t.cancel}
                   </button>
                   <button
                     type="submit"
                     disabled={isUpdating}
                     className="flex-1 brutal-button"
                   >
                     {isUpdating ? t.saving : t.save}
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
     </div>
   );
}

export default Dashboard
