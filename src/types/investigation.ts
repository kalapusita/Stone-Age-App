export type InvestigationStatus = "in_progress" | "submitted";

export interface Investigation {
  id: string;
  student_name: string;
  class_name: string | null;
  started_at: string;

  fire_effect_1: string | null;
  fire_effect_2: string | null;
  fire_response: string | null;
  fire_completed_at: string | null;

  cave_art_interpretation: string | null;
  cave_art_response: string | null;
  cave_art_completed_at: string | null;

  stone_tools_response: string | null;
  stone_tools_completed_at: string | null;

  final_response: string | null;
  submitted_at: string | null;

  status: InvestigationStatus;
  updated_at: string;
}

export type SectionKey = "fire" | "caveArt" | "stoneTools";

export interface FirePayload {
  fire_effect_1: string;
  fire_effect_2: string;
  fire_response: string;
}

export interface CaveArtPayload {
  cave_art_interpretation: string;
  cave_art_response: string;
}

export interface StoneToolsPayload {
  stone_tools_response: string;
}

export interface FinalPayload {
  final_response: string;
}
