import type {
  ProfileEducation,
  ProfileLanguage,
  ProfileProject,
  ProfileSkillGroup,
  ProfileWorkExperience,
} from "@workspace/db";
import profileData from "./developer-profile-data.json" with { type: "json" };

export const DEFAULT_DEVELOPER_PROFILE = {
  ...profileData,
  workExperience: profileData.workExperience as ProfileWorkExperience[],
  education: profileData.education as ProfileEducation[],
  projects: profileData.projects as ProfileProject[],
  technicalSkills: profileData.technicalSkills as ProfileSkillGroup[],
  languages: profileData.languages as ProfileLanguage[],
  status: "published" as const,
};
