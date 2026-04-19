export interface User {
  id: string;
  phone: string;
  nickname: string;
  role: 'owner' | 'walker';
  avatar: string;
  real_name: string;
  id_card: string;
  bio: string;
  rating: number;
  review_count: number;
  order_count: number;
  balance: number;
  service_radius: number;
  service_start_time: string;
  service_end_time: string;
  created_at?: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  vaccines: string[];
  personality: string;
  photo: string;
  created_at?: string;
}

export interface Task {
  id: string;
  owner_id: string;
  walker_id: string | null;
  pet_id: string;
  service_type: 'walk' | 'feed' | 'other';
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  reward: number;
  task_date: string;
  task_time_start: string;
  task_time_end: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  photo: string;
  created_at?: string;
  // Joined fields
  owner_nickname?: string;
  owner_avatar?: string;
  owner_rating?: number;
  walker_nickname?: string;
  walker_avatar?: string;
  walker_rating?: number;
  pet_name?: string;
  pet_species?: string;
  pet_breed?: string;
  pet_photo?: string;
  pet_personality?: string;
}

export interface Message {
  id: string;
  task_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_nickname?: string;
  sender_avatar?: string;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_nickname?: string;
  reviewer_avatar?: string;
}
