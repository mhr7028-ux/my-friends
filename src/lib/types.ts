export type RelationType = 
  | 'spouse'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'cousin'
  | 'relative'
  | 'friend'
  | 'introducer'
  | 'colleague'
  | 'business';

export type PersonGroup = '가족' | '친척' | '고교 동창' | '대학 동문' | '교회 성도' | '사업 파트너' | '지인';

export interface PhysiognomyAnalysis {
  forehead: string; // 관록운 / 사고력
  eyes: string;     // 재물운 / 심성
  nose: string;     // 건강 / 자존감
  mouth: string;    // 인복 / 말년운
  summary: string;  // 총평
  icebreakerTips: string[]; // 대화 시작 추천 팁
  healthNote: string;      // 건강 주의 포인트
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  title: string;
  group: PersonGroup;
  firstMeetingDate: string;
  firstMeetingLocation: string;
  firstMeetingContext: string;
  tags: string[];
  physiognomy?: PhysiognomyAnalysis;
  notes?: string;
  isUser?: boolean; // True if this node represents the logged in User ("나")
}

export interface RelationshipEdge {
  id: string;
  sourceId: string; // ID of person 1
  targetId: string; // ID of person 2
  relationType: RelationType;
  label: string;    // e.g. "사촌 동생", "소개자", "부부"
  notes?: string;
}

export interface Memory {
  id: string;
  personId: string;
  date: string;
  title: string;
  content: string;
  image?: string;
  location?: string;
}

export interface PathStep {
  person: Person;
  edgeToNext?: RelationshipEdge;
}

export interface RelationshipPathResult {
  targetPerson: Person;
  degrees: number;
  path: PathStep[];
  description: string;
  commonFriends: Person[];
}
