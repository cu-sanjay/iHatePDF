import { useState, useCallback, useRef } from "react";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, Plus, Trash2, UserRound, Briefcase, GraduationCap, Award, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/fileUtils";

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skill[];
}

interface TemplateOption {
  id: string;
  name: string;
  previewClass: string;
}

const templateOptions: TemplateOption[] = [
  { id: 'minimal', name: 'Minimal', previewClass: 'bg-white border-2 border-gray-200' },
  { id: 'modern', name: 'Modern', previewClass: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200' },
  { id: 'professional', name: 'Professional', previewClass: 'bg-gray-50 border-2 border-gray-300' },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

const ResumeMaker = () => {
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('personal-info');
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    education: [],
    experience: [],
    skills: [],
  });

  // Update personal information
  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  // Add a new education entry
  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  // Update an education entry
  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Remove an education entry
  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Add a new experience entry
  const addExperience = () => {
    const newExperience: Experience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  // Update an experience entry
  const updateExperience = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Remove an experience entry
  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Add a new skill
  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId(),
      name: '',
      level: 'Intermediate',
    };
    
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  // Update a skill
  const updateSkill = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value as any } : skill
      )
    }));
  };

  // Remove a skill
  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  // Generate PDF resume
  const generateResume = useCallback(async () => {
    if (!resumeRef.current) return;
    
    setIsGenerating(true);
    setProgress(10);
    
    try {
      // Delay for progress animation
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(30);
      
      // Capture the resume component as an image
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      setProgress(70);
      
      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      setProgress(90);
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], `${resumeData.personalInfo.fullName || 'resume'}.pdf`, { type: 'application/pdf' });
      
      downloadFile(pdfFile, pdfFile.name, 'application/pdf');
      
      setProgress(100);
      
      toast({
        title: "Resume generated",
        description: "Your resume has been successfully generated and downloaded",
      });
    } catch (error) {
      console.error("Resume generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "An error occurred while generating your resume. Please try again.",
      });
    } finally {
      // Reset progress after a delay
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
    }
  }, [resumeData, toast]);

  // Reset the form
  const resetForm = () => {
    if (window.confirm("Are you sure you want to reset the form? All your data will be lost.")) {
      setResumeData({
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          summary: '',
        },
        education: [],
        experience: [],
        skills: [],
      });
      setActiveTab('personal-info');
      toast({
        title: "Form reset",
        description: "All form data has been cleared",
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-4 dark:text-white">
            Resume Builder
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Create a professional resume with our easy-to-use builder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Form */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="personal-info" className="text-xs sm:text-sm">Personal</TabsTrigger>
                  <TabsTrigger value="education" className="text-xs sm:text-sm">Education</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs sm:text-sm">Experience</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs sm:text-sm">Skills</TabsTrigger>
                </TabsList>
                
                {/* Personal Information Tab */}
                <TabsContent value="personal-info">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Personal Information</h3>
                    
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={resumeData.personalInfo.address}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                        placeholder="123 Main St, City, Country"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={resumeData.personalInfo.summary}
                        onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                        placeholder="A brief summary of your professional background and career goals"
                        rows={4}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Education Tab */}
                <TabsContent value="education">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Education</h3>
                      <Button 
                        onClick={addEducation} 
                        size="sm" 
                        className="flex items-center text-yellow-500 hover:text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                      >
                        <Plus size={16} className="mr-1" /> Add Education
                      </Button>
                    </div>
                    
                    {resumeData.education.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
                        <GraduationCap size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No education entries yet. Add your educational background.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {resumeData.education.map((edu) => (
                          <Card key={edu.id} className="relative">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-md">Institution</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-gray-400 hover:text-red-500 absolute top-2 right-2"
                                  onClick={() => removeEducation(edu.id)}
                                  aria-label="Remove education"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                placeholder="University or School Name"
                                className="mt-1"
                              />
                            </CardHeader>
                            <CardContent className="space-y-3 pb-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Degree</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                    placeholder="Bachelor's, Master's, etc."
                                  />
                                </div>
                                <div>
                                  <Label>Field of Study</Label>
                                  <Input
                                    value={edu.fieldOfStudy}
                                    onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                                    placeholder="Computer Science, Business, etc."
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="month"
                                    value={edu.startDate}
                                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="month"
                                    value={edu.endDate}
                                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={edu.description}
                                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                  placeholder="Achievements, GPA, relevant coursework, etc."
                                  rows={3}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Experience Tab */}
                <TabsContent value="experience">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Work Experience</h3>
                      <Button 
                        onClick={addExperience} 
                        size="sm" 
                        className="flex items-center text-yellow-500 hover:text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                      >
                        <Plus size={16} className="mr-1" /> Add Experience
                      </Button>
                    </div>
                    
                    {resumeData.experience.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
                        <Briefcase size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No work experience entries yet. Add your work history.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {resumeData.experience.map((exp) => (
                          <Card key={exp.id} className="relative">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-md">Company</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-gray-400 hover:text-red-500 absolute top-2 right-2"
                                  onClick={() => removeExperience(exp.id)}
                                  aria-label="Remove experience"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="Company Name"
                                className="mt-1"
                              />
                            </CardHeader>
                            <CardContent className="space-y-3 pb-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Position</Label>
                                  <Input
                                    value={exp.position}
                                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                    placeholder="Job Title"
                                  />
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <Input
                                    value={exp.location}
                                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                    placeholder="City, Country"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="month"
                                    value={exp.endDate}
                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                    placeholder="Present"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                  placeholder="Describe your responsibilities and achievements"
                                  rows={3}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Skills Tab */}
                <TabsContent value="skills">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Skills</h3>
                      <Button 
                        onClick={addSkill} 
                        size="sm" 
                        className="flex items-center text-yellow-500 hover:text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                      >
                        <Plus size={16} className="mr-1" /> Add Skill
                      </Button>
                    </div>
                    
                    {resumeData.skills.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
                        <Award size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No skills added yet. Add your technical and soft skills.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center">
                            <div className="flex-1 mr-3">
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                placeholder="Skill name (e.g., JavaScript, Project Management)"
                              />
                            </div>
                            <div className="w-1/3 mr-2">
                              <Select
                                value={skill.level}
                                onValueChange={(value) => updateSkill(skill.id, 'level', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                  <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => removeSkill(skill.id)}
                              aria-label="Remove skill"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Resume Template</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {templateOptions.map(template => (
                    <div key={template.id} className="text-center">
                      <div 
                        className={`h-24 rounded-lg mb-2 ${template.previewClass} ${selectedTemplate === template.id ? 'ring-2 ring-yellow-500' : ''}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      ></div>
                      <div className="text-sm">{template.name}</div>
                    </div>
                  ))}
                </div>
                
                {isGenerating && (
                  <div className="mb-6">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generating PDF...</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5" />
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    onClick={generateResume}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={isGenerating}
                  >
                    <Download className="mr-2 h-4 w-4" /> Generate Resume
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Reset Form
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resume Preview */}
          <div className="bg-white rounded-xl shadow-md overflow-auto dark:bg-gray-800 dark:border dark:border-gray-700 h-[800px]">
            <div className="p-6">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This is how your resume will look when generated</p>
              </div>
              
              <div ref={resumeRef} className={`p-8 bg-white border border-gray-200 min-h-[700px] overflow-hidden ${
                selectedTemplate === 'modern' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 
                selectedTemplate === 'professional' ? 'bg-gray-50' : ''
              }`}>
                {/* Resume Header */}
                <div className={`mb-6 ${
                  selectedTemplate === 'modern' ? 'border-b-2 border-blue-300 pb-4' : 
                  selectedTemplate === 'professional' ? 'bg-gray-100 p-4 rounded' : 'border-b border-gray-300 pb-4'
                }`}>
                  <h1 className={`text-2xl font-bold ${
                    selectedTemplate === 'modern' ? 'text-blue-700' : 
                    selectedTemplate === 'professional' ? 'text-gray-800' : 'text-gray-900'
                  }`}>
                    {resumeData.personalInfo.fullName || 'Your Name'}
                  </h1>
                  
                  <div className={`mt-2 text-sm ${
                    selectedTemplate === 'modern' ? 'text-blue-600' : 
                    selectedTemplate === 'professional' ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    {resumeData.personalInfo.email && (
                      <div className="flex items-center gap-1 mb-1">
                        <span>Email:</span>
                        <span>{resumeData.personalInfo.email}</span>
                      </div>
                    )}
                    
                    {resumeData.personalInfo.phone && (
                      <div className="flex items-center gap-1 mb-1">
                        <span>Phone:</span>
                        <span>{resumeData.personalInfo.phone}</span>
                      </div>
                    )}
                    
                    {resumeData.personalInfo.address && (
                      <div className="flex items-center gap-1">
                        <span>Address:</span>
                        <span>{resumeData.personalInfo.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Summary */}
                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className={`text-lg font-semibold mb-2 ${
                      selectedTemplate === 'modern' ? 'text-blue-700 border-b border-blue-200 pb-1' : 
                      selectedTemplate === 'professional' ? 'text-gray-800 uppercase tracking-wider' : 'text-gray-800'
                    }`}>
                      Professional Summary
                    </h2>
                    <p className="text-sm text-gray-700">{resumeData.personalInfo.summary}</p>
                  </div>
                )}
                
                {/* Experience */}
                {resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-lg font-semibold mb-3 ${
                      selectedTemplate === 'modern' ? 'text-blue-700 border-b border-blue-200 pb-1' : 
                      selectedTemplate === 'professional' ? 'text-gray-800 uppercase tracking-wider' : 'text-gray-800'
                    }`}>
                      Work Experience
                    </h2>
                    
                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className={
                          selectedTemplate === 'modern' ? 'pl-3 border-l-2 border-blue-200' : ''
                        }>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-md font-medium text-gray-800">{exp.position || 'Position'}</h3>
                              <p className="text-sm text-gray-600">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {exp.startDate && (
                                <>
                                  {new Date(exp.startDate).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                  {exp.endDate ? ` - ${new Date(exp.endDate).toLocaleString('default', { month: 'short', year: 'numeric' })}` : ' - Present'}
                                </>
                              )}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {resumeData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className={`text-lg font-semibold mb-3 ${
                      selectedTemplate === 'modern' ? 'text-blue-700 border-b border-blue-200 pb-1' : 
                      selectedTemplate === 'professional' ? 'text-gray-800 uppercase tracking-wider' : 'text-gray-800'
                    }`}>
                      Education
                    </h2>
                    
                    <div className="space-y-4">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className={
                          selectedTemplate === 'modern' ? 'pl-3 border-l-2 border-blue-200' : ''
                        }>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-md font-medium text-gray-800">{edu.institution || 'Institution'}</h3>
                              <p className="text-sm text-gray-600">{edu.degree || 'Degree'}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {edu.startDate && (
                                <>
                                  {new Date(edu.startDate).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                  {edu.endDate ? ` - ${new Date(edu.endDate).toLocaleString('default', { month: 'short', year: 'numeric' })}` : ' - Present'}
                                </>
                              )}
                            </div>
                          </div>
                          {edu.description && (
                            <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {resumeData.skills.length > 0 && (
                  <div>
                    <h2 className={`text-lg font-semibold mb-3 ${
                      selectedTemplate === 'modern' ? 'text-blue-700 border-b border-blue-200 pb-1' : 
                      selectedTemplate === 'professional' ? 'text-gray-800 uppercase tracking-wider' : 'text-gray-800'
                    }`}>
                      Skills
                    </h2>
                    
                    {selectedTemplate === 'modern' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center text-sm">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              skill.level === 'Expert' ? 'bg-blue-600' :
                              skill.level === 'Advanced' ? 'bg-blue-500' :
                              skill.level === 'Intermediate' ? 'bg-blue-400' :
                              'bg-blue-300'
                            }`}></div>
                            <span className="text-gray-800">{skill.name || 'Skill'}</span>
                            <span className="ml-1 text-xs text-gray-500">({skill.level})</span>
                          </div>
                        ))}
                      </div>
                    ) : selectedTemplate === 'professional' ? (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="inline-block bg-gray-100 rounded px-2 py-1 text-sm text-gray-800">
                            {skill.name || 'Skill'} ({skill.level})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {resumeData.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center text-sm">
                            <span className="text-gray-800">{skill.name || 'Skill'}</span>
                            <span className="ml-1 text-xs text-gray-500">({skill.level})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeMaker;
