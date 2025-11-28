import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Pointage from "@/pages/Pointage";
import Evaluation from "@/pages/Evaluation";
import Personnalisation from "@/pages/Personnalisation";
import Planning from "@/pages/Planning";
import PlanningEncadrants from "@/pages/PlanningEncadrants";
import Localisation from "@/pages/Localisation";
import Urgence from "@/pages/Urgence";
import UserManagement from "@/pages/UserManagement";
import InstructorProfiles from "@/pages/InstructorProfiles";
import InstructorProfile from "@/pages/InstructorProfile";
import EditInstructor from "@/pages/EditInstructor";
import StudentProfiles from "@/pages/StudentProfiles";
import EditStudent from "@/pages/EditStudent";
import DownloadPage from "@/pages/Download";
import DropboxUpload from "@/pages/DropboxUpload";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Chargement...</p>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - accessible without login */}
      <Route path="/download" component={DownloadPage} />
      <Route path="/dropbox-upload" component={DropboxUpload} />
      
      {/* If not logged in, show login for all other routes */}
      {!user ? (
        <Route component={Login} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/pointage" component={Pointage} />
          <Route path="/evaluation" component={Evaluation} />
          <Route path="/personnalisation" component={Personnalisation} />
          <Route path="/planning" component={Planning} />
          <Route path="/planning-encadrants" component={PlanningEncadrants} />
          <Route path="/localisation" component={Localisation} />
          <Route path="/urgence" component={Urgence} />
          <Route path="/fiches-eleve" component={StudentProfiles} />
          <Route path="/fiches-eleve/:id/modifier" component={EditStudent} />
          <Route path="/gestion" component={UserManagement} />
          <Route path="/encadrants" component={InstructorProfiles} />
          <Route path="/encadrants/:id" component={EditInstructor} />
          <Route path="/mon-profil" component={InstructorProfile} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
