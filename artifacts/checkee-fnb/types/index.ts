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

export type MealSession = 'sang' | 'trua' | 'chieu' | 'phu';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  image: number;
  isMonitored: boolean;
  mealType: 'main' | 'dessert' | 'drink';
  session: MealSession;
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

export interface TraceIngredient {
  name: string;
  supplier: string;
  batchNo: string;
  unit: string;
}

export interface TraceabilityRecord {
  id: string;
  mealId: string;
  mealName: string;
  image: number;
  traceCode: string;
  isMonitored: boolean;
  mealTypeCategory: string;
  mealTypeDesc: string;
  chefName: string;
  processCode: string;
  cookTime: string;
  traceIngredients: TraceIngredient[];
  totalScans: number;
  todayScans: number;
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
  status: 'active' | 'expired' | 'disposed' | 'future';
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
  photos: (string | number)[];
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
  body?: string;
  image?: number;
  isRead: boolean;
  createdAt: string;
}
