export interface Ingredient {
  name: string;
  amount: string;
  origin: string;
}

export interface Nutrition {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  image: number;
  isMonitored: boolean;
  mealType: 'main' | 'dessert' | 'drink';
  dayIndex: number;
  ingredients: Ingredient[];
  nutrition: Nutrition;
  preparation: string;
  foodSafetyStatus: 'safe' | 'warning' | 'danger';
  category: string;
}

export interface ProcessingStep {
  id: string;
  date: string;
  location: string;
  action: string;
  responsible: string;
}

export interface TraceabilityRecord {
  id: string;
  mealId: string;
  mealName: string;
  image: number;
  ingredient: string;
  supplier: string;
  supplierAddress: string;
  origin: string;
  productionBatch: string;
  manufacturingDate: string;
  expiryDate: string;
  certifications: string[];
  processingHistory: ProcessingStep[];
}

export interface SampleRetention {
  id: string;
  mealId: string;
  mealName: string;
  image: number;
  storedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'disposed';
  storageLocation: string;
  sampleCount: number;
}

export interface FeedbackItem {
  id: string;
  mealId: string;
  mealName: string;
  complaintType: 'quality' | 'safety' | 'quantity' | 'hygiene' | 'other';
  description: string;
  symptoms: string;
  photos: string[];
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  submittedAt: string;
  resolvedAt?: string;
  response?: string;
}

export interface AppNotification {
  id: string;
  type: 'menu' | 'safety' | 'complaint' | 'school';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
