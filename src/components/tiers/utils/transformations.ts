import { Tier, TierFormValues, EntityType } from "../types";

/**
 * Sépare un nom complet en prénom et nom
 */
export const splitContactName = (fullName: string): { prenom: string; nom: string } => {
  if (!fullName || typeof fullName !== 'string') {
    return { prenom: '', nom: '' };
  }

  const contactParts = fullName.trim().split(' ');
  
  if (contactParts.length > 1) {
    // Si plusieurs mots, considérer le premier comme prénom et le reste comme nom
    return {
      prenom: contactParts[0],
      nom: contactParts.slice(1).join(' ')
    };
  } else {
    // Si un seul mot, le considérer comme nom
    return {
      prenom: '',
      nom: fullName.trim()
    };
  }
};

/**
 * Assemble un prénom et nom en nom complet
 */
export const joinContactName = (prenom?: string, nom?: string): string => {
  return [prenom, nom]
    .filter(Boolean)
    .map(part => part?.trim())
    .join(' ');
};

/**
 * Sépare une adresse complète en composants
 */
export const splitAddress = (fullAddress: string): { 
  rue: string; 
  codePostal: string; 
  ville: string; 
} => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return { rue: '', codePostal: '', ville: '' };
  }

  // Format attendu: "Rue, Code Postal Ville"
  const parts = fullAddress.split(',');
  
  // Récupérer la rue (avant la virgule)
  const rue = parts[0]?.trim() || '';
  
  let codePostal = '';
  let ville = '';
  
  // Traiter code postal et ville (après la virgule)
  if (parts.length > 1) {
    const villeInfo = parts[1].trim();
    
    // Chercher à séparer code postal et ville
    // Le code postal est généralement les 5 premiers caractères numériques
    const codePostalMatch = villeInfo.match(/^(\d{5})\s+(.+)$/);
    
    if (codePostalMatch) {
      codePostal = codePostalMatch[1];
      ville = codePostalMatch[2];
    } else {
      // Si pas de format clair, mettre tout dans ville
      ville = villeInfo;
    }
  }
  
  return { rue, codePostal, ville };
};

/**
 * Assemble les composants d'adresse en adresse complète
 */
export const joinAddress = (rue?: string, codePostal?: string, ville?: string): string => {
  const rueFormatted = rue?.trim() || '';
  const codePostalFormatted = codePostal?.trim() || '';
  const villeFormatted = ville?.trim() || '';
  
  if (!rueFormatted && !codePostalFormatted && !villeFormatted) {
    return '';
  }
  
  if (rueFormatted && (codePostalFormatted || villeFormatted)) {
    const villeComplete = [codePostalFormatted, villeFormatted]
      .filter(Boolean)
      .join(' ');
    return `${rueFormatted}, ${villeComplete}`.trim();
  }
  
  if (rueFormatted) {
    return rueFormatted;
  }
  
  return [codePostalFormatted, villeFormatted].filter(Boolean).join(' ');
};

/**
 * Transforme un objet Tier en valeurs de formulaire
 */
export const transformTierToFormValues = (tier: Tier): TierFormValues => {
  console.log("transformTierToFormValues: Converting tier to form values", tier);
  
  // Séparer le contact en prénom/nom
  const { prenom, nom } = splitContactName(tier.contact);
  
  // Séparer l'adresse en composants
  const { rue, codePostal, ville } = splitAddress(tier.address);
  
  const formValues: TierFormValues = {
    // Informations générales
    name: tier.name || '',
    types: Array.isArray(tier.type) ? tier.type : [],
    siret: tier.siret || '',
    status: (tier.status === 'active' || tier.status === 'inactive') ? tier.status : 'active',
    entityType: 'entreprise', // Par défaut, sera déterminé par le contexte
    
    // Contact
    contactPrenom: prenom,
    contactNom: nom,
    email: tier.email || '',
    phone: tier.phone || '',
    fonction: '', // À déterminer selon le contexte
    
    // Adresse
    adresseRue: rue,
    adresseCodePostal: codePostal,
    adresseVille: ville,
    pays: 'France', // Par défaut
    
    // Champs reconstitués (seront recalculés)
    contact: tier.contact || '',
    address: tier.address || '',
  };
  
  console.log("transformTierToFormValues: Converted form values", formValues);
  return formValues;
};

/**
 * Transforme les valeurs de formulaire en objet Tier
 */
export const transformFormValuesToTier = (
  values: TierFormValues, 
  entityType?: EntityType,
  existingId?: string
): Tier => {
  console.log("transformFormValuesToTier: Converting form values to tier", { values, entityType });
  
  // Déterminer le type d'entité
  const finalEntityType = entityType || values.entityType || 'entreprise';
  
  // Assembler le contact complet
  const contact = joinContactName(values.contactPrenom, values.contactNom);
  
  // Assembler l'adresse complète
  const address = joinAddress(values.adresseRue, values.adresseCodePostal, values.adresseVille);
  
  const tier: Tier = {
    id: existingId || '',
    name: values.name || '',
    type: values.types || [],
    contact,
    email: values.email || '',
    phone: values.phone || '',
    address,
    siret: values.siret || '',
    status: values.status || 'active',
  };
  
  console.log("transformFormValuesToTier: Converted tier", tier);
  return tier;
};

/**
 * Valide si les données de formulaire sont cohérentes avec le type d'entité
 */
export const validateFormDataConsistency = (
  values: TierFormValues, 
  entityType: EntityType
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validation pour entreprise
  if (entityType === 'entreprise') {
    if (!values.siret || values.siret.trim().length === 0) {
      errors.push('Le SIRET est obligatoire pour une entreprise');
    }
  }
  
  // Validation pour particulier
  if (entityType === 'particulier') {
    if (!values.contactPrenom || values.contactPrenom.trim().length === 0) {
      errors.push('Le prénom est obligatoire pour un particulier');
    }
  }
  
  // Validations communes
  if (!values.name || values.name.trim().length === 0) {
    errors.push('Le nom est obligatoire');
  }
  
  if (!values.contactNom || values.contactNom.trim().length === 0) {
    errors.push('Le nom du contact est obligatoire');
  }
  
  if (!values.email || values.email.trim().length === 0) {
    errors.push('L\'email est obligatoire');
  }
  
  if (!values.phone || values.phone.trim().length === 0) {
    errors.push('Le téléphone est obligatoire');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 