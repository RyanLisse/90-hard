export type AvatarStyle = "solo-leveling" | "ghibli";

export interface GenerateAvatarInput {
  style: AvatarStyle;
  mood: string;
}

export interface AvatarPort {
  generate(input: GenerateAvatarInput): Promise<{ url: string }>;
}

export const buildAvatarPrompt = ({ style, mood }: GenerateAvatarInput): string => {
  const styleHint = style === "solo-leveling" ? "dynamic-anime dark aura" : "studio-ghibli soft pastel whimsical";
  return `portrait, waist-up, ${styleHint}, expression=${mood}, clean background`;
};

