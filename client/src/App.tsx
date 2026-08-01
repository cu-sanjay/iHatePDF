import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { FileVaultProvider } from "@/context/FileVault";
import Home from "@/pages/Home";
import PdfToImage from "@/pages/PdfToImage";
import ImageToPdf from "@/pages/ImageToPdf";
import CompressPdf from "@/pages/CompressPdf";
import ResumeMaker from "@/pages/ResumeMaker";
import MergePdf from "@/pages/MergePdf";
import SplitPdf from "@/pages/SplitPdf";
import WatermarkPdf from "@/pages/WatermarkPdf";
import LockPdf from "@/pages/LockPdf";
import LatexResume from "@/pages/LatexResume";
import EquationImage from "@/pages/EquationImage";
import Drop from "@/pages/Drop";
import SignPdf from "@/pages/SignPdf";
import CompressImage from "@/pages/CompressImage";

function Router() {
  return (
    <Switch>
      <Route path="/drop" component={Drop} />
      <Route path="/" component={Home} />
      <Route path="/drop" component={Home} />
      <Route path="/pdf-to-image" component={PdfToImage} />
      <Route path="/image-to-pdf" component={ImageToPdf} />
      <Route path="/compress-pdf" component={CompressPdf} />
      <Route path="/compress-image" component={CompressImage} />
      <Route path="/resume-builder" component={ResumeMaker} />
      <Route path="/merge-pdfs" component={MergePdf} />
      <Route path="/split-pdf" component={SplitPdf} />
      <Route path="/watermark-pdf" component={WatermarkPdf} />
      <Route path="/lock-pdf" component={LockPdf} />
      <Route path="/latex-resume" component={LatexResume} />
      <Route path="/equation-to-image" component={EquationImage} />
      <Route path="/sign-pdf" component={SignPdf} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FileVaultProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </FileVaultProvider>
    </QueryClientProvider>
  );
}

export default App;
