export const calculateUserProfileCompletion = (user: any) => {
  if (!user) return 0;

  const fields = [
    user.phone,
    user.whatsappNumber,
    user.dateOfBirth,
    user.gender,
    user.currentLocation,
    user.preferredJobLocation,
    user.educationalQualification,
    user.yearOfGraduation,
    user.workExperienceYears,
    user.currentEmployer,
    user.currentDesignation,
    user.noticePeriod,
    user.currentSalary,
    user.expectedSalary,
    user.technicalSkills?.length ? true : false,
    user.softSkills?.length ? true : false,
    user.interestedSkills?.length ? true : false,
    user.projects?.length ? true : false,
    user.certifications?.length ? true : false,
    user.languagesKnown?.length ? true : false,
    user.resume,
    user.about,
    user.headline,
    user.description,
    user.location,
    user.website,
    user.socialLinks?.linkedin,
    user.socialLinks?.github,
    user.socialLinks?.twitter,
    user.skills?.length ? true : false,
    user.experience?.length ? true : false,
    user.education?.length ? true : false,
    user.profilePhoto,
  ];

  const filled = fields.filter(
    (field) => field !== undefined && field !== null && field !== "" && field !== false
  ).length;

  return Math.round((filled / fields.length) * 100);
};

export const calculateFreelancerProfileCompletion = (freelancer: any) => {
  if (!freelancer) return 0;

  const fields = [
    freelancer.name,
    freelancer.qualification,
    freelancer.contact,
    freelancer.email,
    freelancer.location,
    freelancer.descriptionOfWork,
    freelancer.aboutFreelancer,
    freelancer.photo,
    freelancer.preferences?.length ? true : false,
    freelancer.services?.length ? true : false,
    freelancer.pricing?.min,
    freelancer.pricing?.max,
    freelancer.dateOfBirth,
    freelancer.gender,
    freelancer.educationalQualification,
    freelancer.skills?.length ? true : false,
    freelancer.yearsOfExperience,
    freelancer.currentEmployer,
    freelancer.portfolioUrl,
    freelancer.linkedin,
    freelancer.github,
    freelancer.twitter,
    freelancer.whatsappNumber,
    freelancer.certifications?.length ? true : false,
    freelancer.languagesKnown?.length ? true : false,
    freelancer.toolsProficiency?.length ? true : false,
    freelancer.pastClients?.length ? true : false,
    freelancer.resume,
    freelancer.interviewAvailability,
  ];

  const filled = fields.filter(
    (field) => field !== undefined && field !== null && field !== "" && field !== false
  ).length;

  return Math.round((filled / fields.length) * 100);
};

export const calculateCompanyProfileCompletion = (company: any) => {
  if (!company) return 0;

  const fields = [
    company.name,
    company.domain,
    company.industry,
    company.size,
    company.type,
    company.logo,
    company.tagline,
    company.description,
    company.email,
    company.contactNumber,
    company.registrationName,
    company.panOrTanOrGst,
    company.dateOfIncorporation,
    company.registeredOfficeAddress || company.address,
    company.directorAndKmpDetails,
    company.authorizedSignatory?.name,
    company.authorizedSignatory?.designation,
    company.authorizedSignatory?.signature,
    company.verificationDocs?.length ? true : false,
    company.socialMediaProfiles?.length ? true : false,
  ];

  const filled = fields.filter(
    (field) => field !== undefined && field !== null && field !== "" && field !== false
  ).length;

  return Math.round((filled / fields.length) * 100);
};
