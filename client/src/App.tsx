import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { InstallPrompt } from "@/components/install-prompt";
import TablePage from "@/pages/table";
import SharedTablePage from "@/pages/shared-table";
import CustomTableList from "@/pages/custom-table-list";
import CustomTableView from "@/pages/custom-table";
import HelpPage from "@/pages/help";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-gray-900 dark:to-black -z-10" />
      <div className="min-h-screen pb-16 text-sm relative z-0">
        <Switch>
          <Route path="/">
            {() => <TablePage />}
          </Route>
          <Route path="/share/:shareId">
            {() => <SharedTablePage />}
          </Route>
          <Route path="/custom-tables">
            {() => <CustomTableList />}
          </Route>
          <Route path="/custom/:shareId">
            {() => <CustomTableView />}
          </Route>
          <Route path="/help">
            {() => <HelpPage />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <InstallPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
