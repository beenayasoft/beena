import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, register, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Récupérer l'URL de redirection si elle existe
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    username: "",
    company: "",
    acceptTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Réinitialiser les erreurs lorsque l'utilisateur modifie un champ
    setFormError(null);
  };

  // Séparer le nom complet en prénom et nom
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { first_name: parts[0], last_name: '' };
    }
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { first_name: firstName, last_name: lastName };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      if (mode === "login") {
        // Connexion
        await login({
          email: formData.email,
          password: formData.password,
        });
        
        // Afficher un toast de succès
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre espace Benaya",
        });
        
        // Rediriger vers la page précédente ou le tableau de bord
        navigate(from);
      } else {
        // Inscription
        // Vérifier que les mots de passe correspondent
        if (formData.password !== formData.password2) {
          setFormError("Les mots de passe ne correspondent pas");
          setIsSubmitting(false);
          return;
        }
        
        // Vérifier que les conditions sont acceptées
        if (!formData.acceptTerms) {
          setFormError("Vous devez accepter les conditions d'utilisation");
          setIsSubmitting(false);
          return;
        }
        
        // Séparer le nom complet en prénom et nom
        const { first_name, last_name } = splitName(formData.first_name);
        
        // Créer un nom d'utilisateur à partir de l'email si non fourni
        const username = formData.username || formData.email.split('@')[0];
        
        // Préparer les données pour l'inscription
        await register({
          email: formData.email,
          username: username,
          password: formData.password,
          password2: formData.password2,
          first_name: first_name,
          last_name: last_name,
          company: formData.company,
        });
        
        // Afficher un toast de succès
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
        });
        
        // Rediriger vers le tableau de bord
        navigate("/");
      }
    } catch (error: any) {
      // Afficher l'erreur
      setFormError(error.response?.data?.detail || error.message || "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 benaya-gradient relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 text-white">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                  <g fill="currentColor" opacity="0.9">
                    <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                    <path d="M8.66 9L16 4.5V13.5L8.66 18L1.34 13.5V4.5L8.66 9Z" />
                    <path d="M31.34 9L38.66 4.5V13.5L31.34 18L24 13.5V4.5L31.34 9Z" />
                    <path d="M8.66 31L16 26.5V35.5L8.66 40L1.34 35.5V26.5L8.66 31Z" />
                    <path d="M31.34 31L38.66 26.5V35.5L31.34 40L24 35.5V26.5L31.34 31Z" />
                    <path d="M20 38L27.32 33.5V24.5L20 20L12.68 24.5V33.5L20 38Z" />
                  </g>
                  <path
                    d="M15 20L18.5 23.5L25 17"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">benaya</h1>
              <p className="text-lg opacity-90">ERP Construction</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Gérez vos chantiers en toute simplicité
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              La solution complète pour la gestion de vos projets de
              construction. Devis, planning, facturation, tout en un.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">Gestion complète des devis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">
                  Suivi des chantiers en temps réel
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-lg">Facturation automatisée</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-benaya-900 flex items-center justify-center">
                <div className="w-6 h-6 text-white">
                  <svg
                    viewBox="0 0 40 40"
                    fill="none"
                    className="w-full h-full"
                  >
                    <g fill="currentColor" opacity="0.9">
                      <path d="M20 2L27.32 6.5V15.5L20 20L12.68 15.5V6.5L20 2Z" />
                    </g>
                    <path
                      d="M15 20L18.5 23.5L25 17"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-benaya-900">benaya</h1>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {mode === "login"
                ? "Connectez-vous à votre espace Benaya"
                : "Rejoignez des milliers d'entrepreneurs"}
            </p>
          </div>

          {/* Afficher les erreurs */}
          {(formError || error) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || error}
              </AlertDescription>
            </Alert>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field (Signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="first_name"
                  className="text-neutral-900 dark:text-white"
                >
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="pl-10 benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Company Field (Signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="company"
                  className="text-neutral-900 dark:text-white"
                >
                  Entreprise
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="company"
                    type="text"
                    placeholder="Mon entreprise de construction"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    className="pl-10 benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-neutral-900 dark:text-white"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@entreprise.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 benaya-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-neutral-900 dark:text-white"
              >
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10 benaya-input"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password Field (Signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="password2"
                  className="text-neutral-900 dark:text-white"
                >
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="password2"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password2}
                    onChange={(e) =>
                      handleInputChange("password2", e.target.value)
                    }
                    className="pl-10 pr-10 benaya-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Terms (Signup only) */}
            {mode === "signup" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("acceptTerms", checked as boolean)
                  }
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  J'accepte les{" "}
                  <a href="#" className="text-benaya-900 hover:underline">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="#" className="text-benaya-900 hover:underline">
                    politique de confidentialité
                  </a>
                </Label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full benaya-button-primary text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : mode === "login" ? (
                "Se connecter"
              ) : (
                "Créer mon compte"
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400">
                {mode === "login"
                  ? "Vous n'avez pas de compte ?"
                  : "Vous avez déjà un compte ?"}
                <Button
                  type="button"
                  variant="link"
                  className="text-benaya-900 hover:underline p-1 ml-1"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setFormError(null);
                  }}
                >
                  {mode === "login" ? "Créer un compte" : "Se connecter"}
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
