import { describe, it, expect } from "vitest";
import {
  calculateEfficiency,
  oneDay,
  oneWeek,
  annualWorkDays,
  annualWorkHours,
} from "./calculateEfficiency";
import { FormScreenProps } from "../screens/FormsScreen.types";

describe("calculateEfficiency", () => {
  // Test constants
  it("should have correct time constants", () => {
    expect(oneDay).toBe(8);
    expect(oneWeek).toBe(40);
    expect(annualWorkDays).toBe(260);
    expect(annualWorkHours).toBe(2080);
  });

  describe("basic calculations", () => {
    it("should calculate efficiency for a full stack developer", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1, // web only
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.isFullStackDev).toBe(true);
      expect(result.isDev).toBe(true);
      expect(result.shipsWebOnly).toBe(true);
      expect(result.identity).toBe("Full-stack Web App Developer");
    });

    it("should calculate efficiency for a freelance developer", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "freelance-app-dev",
        excitingFeatures: [],
        platformsTargeted: 2, // mobile only
        projectsPerYear: 4,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.isFreelanceDev).toBe(true);
      expect(result.isProvider).toBe(true);
      expect(result.shipsMobileOnly).toBe(true);
      expect(result.identity).toBe("Freelance Mobile App Developer");
    });

    it("should calculate efficiency for a startup founder", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "startup-founder",
        excitingFeatures: [],
        platformsTargeted: 3, // universal
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.isStartupFounder).toBe(true);
      expect(result.isStartup).toBe(true);
      expect(result.shipsUniversal).toBe(true);
      expect(result.identity).toBe("Startup Founder");
    });

    it("should calculate efficiency for an indie hacker", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "indiehacker",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 3,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.isIndieHacker).toBe(true);
      expect(result.isStartup).toBe(true);
      expect(result.isDev).toBe(true);
      expect(result.identity).toBe("Solo Indie Dev");
    });

    it("should calculate efficiency for a studio lead", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "studio-lead",
        excitingFeatures: [],
        platformsTargeted: 3,
        projectsPerYear: 10,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.isStudioLead).toBe(true);
      expect(result.isProvider).toBe(true);
      expect(result.isDev).toBe(true);
      expect(result.identity).toBe("Digital Product Studio");
    });
  });

  describe("plugin hours saved", () => {
    it("should calculate hours saved from auth plugin", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth"],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["git-plugins"],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      // Default 1 day + 8 hours for auth
      expect(result.pluginHoursSaved).toBe(oneDay + oneDay);
    });

    it("should calculate hours saved from multiple plugins", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [
          "auth",
          "db",
          "mail",
          "notifications",
          "payments",
          "storage",
        ],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["git-plugins"],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      // Default 1 day + auth 8 + db 5 + mail 8 + notifications 5 + payments 16 + storage 4
      const expectedHours = oneDay + oneDay + 5 + oneDay + 5 + oneDay * 2 + 4;
      expect(result.pluginHoursSaved).toBe(expectedHours);
    });
  });

  describe("exciting features impact", () => {
    it("should add hours for universal starter", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["universal-starter"],
        platformsTargeted: 3, // universal
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.wantsUniversalStarter).toBe(true);
      expect(result.platformSetupHours).toBe(oneWeek * 3);
    });

    it("should add hours for all exciting features", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth"],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [
          "universal-starter",
          "git-plugins",
          "stack-freedom",
          "zod-query-toolkit",
          "generators-scripts",
          "designed-for-copypaste",
          "universal-fs-routing",
        ],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.setupHoursPerProject).toBeGreaterThan(oneWeek);
    });
  });

  describe("platform delivery efficiency", () => {
    it("should calculate efficiency for web only", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1, // web
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.deliveryEfficiency).toBe(2.5); // 150% more efficient
    });

    it("should calculate efficiency for mobile only", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 2, // mobile
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.deliveryEfficiency).toBe(1.75); // 75% more efficient
    });

    it("should calculate efficiency for universal", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 3, // universal
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.deliveryEfficiency).toBe(1); // baseline
    });
  });

  describe("learning gap calculations", () => {
    it("should calculate learning gap for developer with no knowledge", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      // Base 1 day + TS 16 + React 32 + RN 16 + Expo 16 + Next 24 + Zod 4 + RQ 8 = 117 hours base
      // Then multiplied by cumulative knowledge gap modifier
      expect(result.learningGapHours).toBeGreaterThan(100);
      expect(result.numConceptsToLearn).toBe(7);
    });

    it("should calculate minimal learning gap for experienced developer", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.learningGapHours).toBe(oneDay); // Just the base learning time
      expect(result.numConceptsToLearn).toBe(0);
    });

    it("should add learning hours for git plugins", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth", "db", "mail"],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["git-plugins"],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      // Base 8 hours + 6 hours for 3 plugins (2 hours each)
      expect(result.learningGapHours).toBe(oneDay + 6);
    });
  });

  describe("benefit level calculations", () => {
    it("should determine benefit level based on efficiency comparison", () => {
      // Testing specific scenarios instead of trying to force efficiency comparison values
      const rawValuesMinimal = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 3, // universal (no boost)
        projectsPerYear: 1,
      };

      const resultMinimal = calculateEfficiency(
        rawValuesMinimal as FormScreenProps,
      );
      expect(resultMinimal.benefitLevel).toBe("only slightly");

      const rawValuesModerate = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth", "db"],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["universal-starter", "git-plugins"],
        platformsTargeted: 2, // mobile
        projectsPerYear: 2,
      };

      const resultModerate = calculateEfficiency(
        rawValuesModerate as FormScreenProps,
      );
      // The logic checks efficiencyComparison values:
      // > 20 = moderately, > 50 = significantly, > 100 = immensely
      if (
        resultModerate.efficiencyComparison > 20 &&
        resultModerate.efficiencyComparison <= 50
      ) {
        expect(resultModerate.benefitLevel).toBe("moderately");
      } else if (
        resultModerate.efficiencyComparison > 50 &&
        resultModerate.efficiencyComparison <= 100
      ) {
        expect(resultModerate.benefitLevel).toBe("significantly");
      } else if (resultModerate.efficiencyComparison > 100) {
        expect(resultModerate.benefitLevel).toBe("immensely");
      }
    });
  });

  describe("formatRelativeTime", () => {
    it("should format hours correctly", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.formatRelativeTime(5)).toBe("5 hours");
      expect(result.formatRelativeTime(1)).toBe("1 hour");
    });

    it("should format days correctly", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.formatRelativeTime(16)).toBe("2 days");
      expect(result.formatRelativeTime(12)).toBe("12 hours"); // Less than 1.5 days shows as hours
    });

    it("should format weeks correctly", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.formatRelativeTime(80)).toBe("2 weeks");
      expect(result.formatRelativeTime(60)).toBe("7 days"); // Less than 1.5 weeks shows as days
    });

    it("should format months correctly", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.formatRelativeTime(320)).toBe("2 months");
      expect(result.formatRelativeTime(480)).toBe("3 months");
    });
  });

  describe("final calculations", () => {
    it("should calculate annual hours saved correctly", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth", "db"],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "full-product-dev",
        excitingFeatures: ["universal-starter", "git-plugins"],
        platformsTargeted: 1,
        projectsPerYear: 4,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.annualHoursSaved).toBeGreaterThan(0);
      expect(result.finalEfficiencyRate).toBeGreaterThan(0);
    });

    it("should show appropriate benefits flags", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: ["auth", "db", "payments"],
        knownTech: [
          "typescript",
          "react",
          "react-native",
          "expo",
          "nextjs",
          "zod",
          "react-query",
        ],
        identifiesWith: "freelance-app-dev",
        excitingFeatures: ["universal-starter", "git-plugins", "stack-freedom"],
        platformsTargeted: 1,
        projectsPerYear: 6,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.showValueDelivered).toBe(
        result.efficiencyComparison > 10 && result.annualHoursSaved > 0,
      );
      expect(result.showEfficiencyBoost).toBe(
        result.efficiencyComparison > 10 && result.annualAvgEfficiencyBoost > 0,
      );
      expect(result.showRepositioningBenefits).toBe(
        result.isProvider && result.efficiencyComparison > 34,
      );
    });
  });

  describe("edge cases", () => {
    it("should handle missing values with defaults", () => {
      const rawValues = {
        identifiesWith: "full-product-dev",
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result).toBeDefined();
      expect(result.identity).toBe("Full-stack Web App Developer");
    });

    it("should handle zero projects per year", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 0,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.projects).toBe("project");
      expect(result.annualHoursSaved).toBeLessThanOrEqual(0);
    });

    it("should handle multiple projects text", () => {
      const rawValues = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "full-product-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 2,
      };

      const result = calculateEfficiency(rawValues as FormScreenProps);

      expect(result.projects).toBe("projects");
    });
  });

  describe("identity text generation", () => {
    it("should generate correct convincee text", () => {
      const identities = [
        { id: "startup-founder", convincee: "your technical co-founder" },
        { id: "indiehacker", convincee: "the dev in you" },
        { id: "studio-lead", convincee: "your dev team" },
        { id: "freelance-app-dev", convincee: `your client's dev team` },
        { id: "full-product-dev", convincee: "you or your devs" },
      ];

      identities.forEach(({ id, convincee }) => {
        const rawValues = {
          currentSetupHoursPerProject: oneWeek,
          pluginsToMerge: [],
          knownTech: [],
          identifiesWith: id,
          excitingFeatures: [],
          platformsTargeted: 1,
          projectsPerYear: 1,
        };

        const result = calculateEfficiency(rawValues as FormScreenProps);
        expect(result.convincee).toBe(convincee);
      });
    });

    it("should generate correct handover text", () => {
      const rawValues1 = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "freelance-app-dev",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result1 = calculateEfficiency(rawValues1 as FormScreenProps);
      expect(result1.handover).toBe("to your clients");

      const rawValues2 = {
        currentSetupHoursPerProject: oneWeek,
        pluginsToMerge: [],
        knownTech: [],
        identifiesWith: "startup-founder",
        excitingFeatures: [],
        platformsTargeted: 1,
        projectsPerYear: 1,
      };

      const result2 = calculateEfficiency(rawValues2 as FormScreenProps);
      expect(result2.handover).toBe("to potential acquirers");
    });
  });
});
