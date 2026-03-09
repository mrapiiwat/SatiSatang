import { eq } from "drizzle-orm";
import { POLICY_VERSIONS } from "@/common/constants/policy";
import { db } from "@/db";
import { userConsents } from "@/db/schema";

export class ConsentService {
  async getConsentStatus(userId: number) {
    const userAgreements = await db.query.userConsents.findMany({
      where: eq(userConsents.userId, userId),
    });

    const currentTOS = POLICY_VERSIONS.TERMS_OF_SERVICE;
    const currentPrivacy = POLICY_VERSIONS.PRIVACY_POLICY;
    const currentAI = POLICY_VERSIONS.AI_DISCLAIMER;

    const hasTOS = userAgreements.some(
      (c) => c.policyType === "TERMS_OF_SERVICE" && c.version === currentTOS
    );
    const hasPrivacy = userAgreements.some(
      (c) => c.policyType === "PRIVACY_POLICY" && c.version === currentPrivacy
    );
    const hasAI = userAgreements.some(
      (c) => c.policyType === "AI_DISCLAIMER" && c.version === currentAI
    );

    const missingPolicies: string[] = [];
    if (!hasTOS) missingPolicies.push("TERMS_OF_SERVICE");
    if (!hasPrivacy) missingPolicies.push("PRIVACY_POLICY");
    if (!hasAI) missingPolicies.push("AI_DISCLAIMER");

    return {
      hasAcceptedAll: missingPolicies.length === 0,
      missingPolicies,
    };
  }

  async acceptConsents(userId: number, ipAddress: string, userAgent: string) {
    const status = await this.getConsentStatus(userId);

    if (status.hasAcceptedAll) {
      return { message: "All current policies are already accepted" };
    }

    const newConsents = status.missingPolicies.map((policyType) => ({
      userId,
      policyType: policyType as
        | "TERMS_OF_SERVICE"
        | "PRIVACY_POLICY"
        | "AI_DISCLAIMER",
      version: POLICY_VERSIONS[policyType as keyof typeof POLICY_VERSIONS],
      ipAddress,
      userAgent,
    }));

    if (newConsents.length > 0) {
      await db.insert(userConsents).values(newConsents);
    }

    return { message: "Consents recorded successfully" };
  }
}
