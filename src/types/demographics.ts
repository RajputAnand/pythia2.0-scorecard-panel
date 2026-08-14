export interface DemographicsWindow {
  label: string;
  start: string;
}

export interface DemographicsWindows {
  baseline: DemographicsWindow;
  current: DemographicsWindow;
}

export interface AgeDistributionItem {
  age_range: string;
  baseline: { label: string; count: number; percentage: number };
  current: { label: string; count: number; percentage: number };
  change: number;
}

export interface AgeDistributionResponse {
  store_id: string;
  total_people: number;
  windows: DemographicsWindows;
  age_ranges: AgeDistributionItem[];
}

export interface GenderDistributionItem {
  gender: string;
  baseline: { label: string; count: number; percentage: number };
  current: { label: string; count: number; percentage: number };
  change: number;
}

export interface GenderDistributionResponse {
  store_id: string;
  total_people: number;
  windows: DemographicsWindows;
  genders: GenderDistributionItem[];
}

export interface CustomerSegmentItem {
  segment_key: string;
  age_range: string;
  baseline_count: number;
  current_count: number;
  visit_growth_percentage: number | null;
  avg_basket: number;
}

export interface CustomerSegmentsResponse {
  store_id: string;
  windows: DemographicsWindows;
  segments: CustomerSegmentItem[];
}
