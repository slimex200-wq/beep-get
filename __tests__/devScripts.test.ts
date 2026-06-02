import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { spawnSync } from "child_process";

describe("development scripts", () => {
  it("keeps default Expo preview scripts offline to avoid Node 24 doctor startup failures", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );

    expect(packageJson.scripts.start).toBe("expo start --dev-client --offline");
    expect(packageJson.scripts.web).toBe("expo start --web --offline");
    expect(packageJson.scripts["start:online"]).toBe("expo start --dev-client");
    expect(packageJson.scripts["web:online"]).toBe("expo start --web");
  });

  it("keeps a safe iOS release readiness gate script", () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
    const source = readFileSync(
      path.join(process.cwd(), "scripts/ios-release-readiness.mjs"),
      "utf8"
    );
    const githubCi = readFileSync(
      path.join(process.cwd(), ".github/workflows/ci.yml"),
      "utf8"
    );

    expect(packageJson.scripts["release:ios:check"]).toBe(
      "node scripts/ios-release-readiness.mjs"
    );
    expect(packageJson.scripts["release:ios:evidence"]).toBe(
      "node scripts/ios-submission-evidence-check.mjs"
    );
    expect(packageJson.scripts["release:ios:evidence:init"]).toBe(
      "node scripts/create-ios-submission-evidence-template.mjs"
    );
    expect(packageJson.scripts["release:ios:submission"]).toBe(
      "node scripts/ios-submission-gate.mjs"
    );
    expect(packageJson.scripts["presubmit:ios:production"]).toBe(
      "node scripts/ios-submission-gate.mjs"
    );
    expect(source).toContain("com.hypeboyo.beepget");
    expect(source).toContain("EXPO_PUBLIC_ENABLE_IAP_STORE=0");
    expect(source).toContain("EXPO_PUBLIC_SUPPORT_URL");
    expect(source).toContain("docs/deploy/ios-app-store-submission-runbook.md");
    expect(source).toContain("docs/deploy/ios-app-store-metadata-draft.md");
    expect(source).toContain("docs/deploy/ios-app-privacy-label-draft.md");
    expect(source).toContain("docs/deploy/ios-review-notes-template.md");
    expect(source).toContain("docs/qa/ios-screenshot-plan.md");
    expect(source).toContain("docs/qa/ios-testflight-qa-evidence.md");
    expect(source).toContain("docs/legal/support.md");
    expect(source).toContain("docs/legal/public/privacy.html");
    expect(source).toContain("Public legal manifest maps privacy HTML");
    expect(source).toContain("Public privacy HTML discloses local-only contacts");
    expect(source).toContain("Public account deletion HTML describes Apple token revocation");
    expect(source).toContain("Public support HTML warns against secret sharing");
    expect(source).toContain("targets/BeepWidgetExtension/PrivacyInfo.xcprivacy");
    expect(source).toContain("targets/BeepNotificationService/PrivacyInfo.xcprivacy");
    expect(source).toContain("NSPrivacyAccessedAPICategoryUserDefaults");
    expect(source).toContain("1C8F.1");
    expect(source).toContain("metadataSubtitle.length");
    expect(source).toContain("Buffer.byteLength(metadataKeywords");
    expect(source).toContain("microphonePermission === false");
    expect(source).toContain("recordAudioAndroid === false");
    expect(source).toContain("contactsPermission?.includes(\"read contacts locally\")");
    expect(source).toContain("Contact discovery has no Supabase import");
    expect(source).toContain("Contact discovery performs no remote Supabase call");
    expect(source).toContain("Settings exposes in-app account deletion");
    expect(source).toContain("Native Apple login uses Supabase signInWithIdToken");
    expect(source).toContain("Native Apple login requires authorizationCode");
    expect(source).toContain("Native Apple login stores server-side revocation token");
    expect(source).toContain("Store Apple revocation function encrypts token material");
    expect(source).toContain("Store Apple revocation function requires refresh token for later deletion");
    expect(source).toContain("Store Apple revocation function has no access-token fallback");
    expect(source).toContain("Delete account Edge Function calls Apple revoke endpoint");
    expect(source).toContain("Apple token migration constrains token type to refresh_token only");
    expect(source).toContain("Apple token migration avoids plaintext refresh-token storage");
    expect(source).toContain("Apple deletion/revocation support is documented");
    expect(source).toContain("Apple deletion/revocation doc cites TN3194");
    expect(source).toContain("Apple deletion/revocation doc rejects access-token fallback");
    expect(source).toContain("Apple deletion/revocation doc requires backend deployment and TestFlight proof");
    expect(source).toContain("Redacted Submission Evidence Packet");
    expect(source).toContain("Machine-Checkable Evidence File");
    expect(source).toContain("Submission evidence script checks deletion audit outcome");
    expect(source).toContain("Submission evidence script rejects reserved placeholder URLs");
    expect(source).toContain("Submission evidence script rejects all-zero request IDs");
    expect(source).toContain("Submission evidence script checks build identity");
    expect(source).toContain("Submission evidence script requires secondary OAuth QA when enabled");
    expect(source).toContain("Submission evidence script requires evidence references");
    expect(source).toContain("TestFlight flow evidence references include");
    expect(source).toContain("TestFlight Blink did not request microphone permission");
    expect(source).toContain("TestFlight Contacts prompt shows local-only copy");
    expect(source).toContain("App Store Connect evidence references include");
    expect(source).toContain("EAS public Supabase URL matches backend project");
    expect(source).toContain("Submission evidence script matches EAS public URL values");
    expect(source).toContain("Submission evidence script matches App Store Connect public URLs");
    expect(source).toContain("Submission evidence template generator writes ignored release template");
    expect(source).toContain("Submission evidence template generator refuses overwrite unless forced");
    expect(source).toContain("Submission evidence template generator includes all TestFlight rows");
    expect(source).toContain("Submission evidence template generator includes permission checks");
    expect(source).toContain("Submission evidence template generator includes App Store Connect section refs");
    expect(source).toContain("Submission evidence template generator records EAS public values");
    expect(source).toContain("Submission evidence template generator includes build identity");
    expect(source).toContain("Submission evidence template generator is fail-by-default");
    expect(source).toContain("Submission gate runs repo-local release readiness first");
    expect(source).toContain("Submission gate requires private evidence file");
    expect(source).toContain("Submission gate runs private evidence checker");
    expect(source).toContain("Submission runbook documents npm submit guard");
    expect(source).toContain("Submission runbook includes public legal bundle file");
    expect(source).toContain("Submission runbook includes redacted evidence instruction");
    expect(source).toContain("Delete account Edge Function requires bearer authentication");
    expect(source).toContain("Delete account Edge Function deletes Supabase Auth user");
    expect(source).toContain("External release actions to complete or reconfirm before submission");
    expect(source).toContain("iOS production submit is guarded by submission gate");
    expect(source).toContain("CI validate runs repo-local iOS release readiness gate");
    expect(githubCi).toContain("npm run release:ios:check");
    expect(source).not.toContain("process.env.APP_STORE_CONNECT_PRIVATE_KEY");
    expect(source).not.toContain("supabase secrets set");
  });

  it("validates redacted iOS submission evidence JSON", () => {
    const script = path.join(
      process.cwd(),
      "scripts/ios-submission-evidence-check.mjs"
    );
    const tempDir = mkdtempSync(path.join(tmpdir(), "beep-ios-evidence-"));
    const evidencePath = path.join(tempDir, "ios-submission-evidence.json");
    const validEvidence = createValidSubmissionEvidence();

    try {
      writeFileSync(evidencePath, JSON.stringify(validEvidence), "utf8");
      const pass = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(pass.status).toBe(0);
      expect(pass.stdout).toContain("iOS submission evidence checks passed");

      const invalidEvidence = {
        ...validEvidence,
        deletionAudit: {
          ...validEvidence.deletionAudit,
          appleRevokeStatus: "failed",
        },
      };
      writeFileSync(evidencePath, JSON.stringify(invalidEvidence), "utf8");
      const fail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(fail.status).toBe(1);
      expect(fail.stderr).toContain("Deletion audit Apple revoke status acceptable");

      const mismatchedBuildIdentity = {
        ...validEvidence,
        build: {
          ...validEvidence.build,
          appVersion: "9.9.9",
          appStoreConnectBuildNumber: "9.9.9 (17)",
          easBuildProfile: "preview",
        },
      };
      writeFileSync(evidencePath, JSON.stringify(mismatchedBuildIdentity), "utf8");
      const buildIdentityFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(buildIdentityFail.status).toBe(1);
      expect(buildIdentityFail.stderr).toContain("Build app version matches app config");
      expect(buildIdentityFail.stderr).toContain("Build uses production EAS profile");

      const placeholderEvidence = {
        ...validEvidence,
        publicUrls: {
          ...validEvidence.publicUrls,
          privacyUrl: "https://your-domain.example/privacy",
        },
        deletionAudit: {
          ...validEvidence.deletionAudit,
          requestId: "00000000-0000-4000-8000-000000000000",
        },
        APPLE_PRIVATE_KEY: "not-a-real-key-but-forbidden",
      };
      writeFileSync(evidencePath, JSON.stringify(placeholderEvidence), "utf8");
      const placeholderFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(placeholderFail.status).toBe(1);
      expect(placeholderFail.stderr).toContain("Public privacy URL is HTTPS");
      expect(placeholderFail.stderr).toContain("Deletion audit requestId is UUID-like");
      expect(placeholderFail.stderr).toContain("forbidden secret-like key");

      const mismatchedUrlsEvidence = {
        ...validEvidence,
        easEnv: {
          ...validEvidence.easEnv,
          publicValues: {
            ...validEvidence.easEnv.publicValues,
            EXPO_PUBLIC_SUPABASE_URL: "https://other-project.supabase.co",
            EXPO_PUBLIC_SUPPORT_URL: "https://beep-get.app/help",
          },
        },
        appStoreConnect: {
          ...validEvidence.appStoreConnect,
          privacyPolicyUrl: "https://beep-get.app/privacy-policy",
        },
      };
      writeFileSync(evidencePath, JSON.stringify(mismatchedUrlsEvidence), "utf8");
      const mismatchFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(mismatchFail.status).toBe(1);
      expect(mismatchFail.stderr).toContain("EAS public Supabase URL matches backend project");
      expect(mismatchFail.stderr).toContain("EAS public support URL matches evidence URL");
      expect(mismatchFail.stderr).toContain("App Store Connect privacy policy URL matches public URL");

      const missingFlowEvidence = {
        ...validEvidence,
        testflight: {
          ...validEvidence.testflight,
          flowEvidenceRefs: {
            ...validEvidence.testflight.flowEvidenceRefs,
            "IOS-QA-009": [],
          },
        },
      };
      writeFileSync(evidencePath, JSON.stringify(missingFlowEvidence), "utf8");
      const flowEvidenceFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(flowEvidenceFail.status).toBe(1);
      expect(flowEvidenceFail.stderr).toContain("TestFlight flow evidence references include IOS-QA-009");

      const missingPermissionEvidence = {
        ...validEvidence,
        testflight: {
          ...validEvidence.testflight,
          permissionChecks: {
            ...validEvidence.testflight.permissionChecks,
            blinkMicrophonePromptAbsent: false,
            evidenceRefs: {
              ...validEvidence.testflight.permissionChecks.evidenceRefs,
              contacts: [],
            },
          },
        },
      };
      writeFileSync(evidencePath, JSON.stringify(missingPermissionEvidence), "utf8");
      const permissionEvidenceFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(permissionEvidenceFail.status).toBe(1);
      expect(permissionEvidenceFail.stderr).toContain("TestFlight Blink did not request microphone permission");
      expect(permissionEvidenceFail.stderr).toContain("TestFlight permission evidence references include contacts");

      const missingAppStoreSectionEvidence = {
        ...validEvidence,
        appStoreConnect: {
          ...validEvidence.appStoreConnect,
          evidenceRefs: {
            ...validEvidence.appStoreConnect.evidenceRefs,
            screenshots: [],
          },
        },
      };
      writeFileSync(evidencePath, JSON.stringify(missingAppStoreSectionEvidence), "utf8");
      const appStoreSectionFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(appStoreSectionFail.status).toBe(1);
      expect(appStoreSectionFail.stderr).toContain("App Store Connect evidence references include screenshots");

      const missingRefsEvidence = {
        ...validEvidence,
        evidenceRefs: {
          ...validEvidence.evidenceRefs,
          deletionAudit: [],
        },
      };
      writeFileSync(evidencePath, JSON.stringify(missingRefsEvidence), "utf8");
      const refsFail = spawnSync(process.execPath, [script, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(refsFail.status).toBe(1);
      expect(refsFail.stderr).toContain("Evidence references include deletionAudit");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("creates a fail-by-default iOS submission evidence template", () => {
    const templateScript = path.join(
      process.cwd(),
      "scripts/create-ios-submission-evidence-template.mjs"
    );
    const evidenceScript = path.join(
      process.cwd(),
      "scripts/ios-submission-evidence-check.mjs"
    );
    const tempDir = mkdtempSync(path.join(tmpdir(), "beep-ios-evidence-template-"));
    const templatePath = path.join(tempDir, "private", "ios-submission-evidence.json");

    try {
      const created = spawnSync(process.execPath, [templateScript, templatePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(created.status).toBe(0);
      expect(existsSync(templatePath)).toBe(true);

      const template = readFileSync(templatePath, "utf8");
      expect(template).toContain("IOS-QA-016");
      expect(template).toContain("appleRevocationSecretNamesPresent");
      expect(template).toContain("flowEvidenceRefs");
      expect(template).toContain("permissionChecks");
      expect(template).toContain("blinkMicrophonePromptAbsent");
      expect(template).toContain("appVersion");
      expect(template).toContain("easBuildProfile");
      expect(template).toContain("easChannel");
      expect(template).toContain("app-store-connect-screenshots");
      expect(template).toContain("app-store-connect-review-notes");
      expect(template).toContain("publicValues");
      expect(template).toContain("your-domain.example");
      expect(template).not.toContain("-----BEGIN");

      const failByDefault = spawnSync(process.execPath, [evidenceScript, templatePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(failByDefault.status).toBe(1);
      expect(failByDefault.stderr).toContain("Public privacy URL is HTTPS");
      expect(failByDefault.stderr).toContain("App Store Connect evidence references include metadata");
      expect(failByDefault.stderr).toContain("TestFlight used two accounts");
      expect(failByDefault.stderr).toContain("TestFlight Blink did not request microphone permission");
      expect(failByDefault.stderr).toContain("Deletion audit requestId is UUID-like");
      expect(failByDefault.stderr).toContain("Redaction confirmed");

      const refusedOverwrite = spawnSync(process.execPath, [templateScript, templatePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(refusedOverwrite.status).toBe(1);
      expect(refusedOverwrite.stderr).toContain("Refusing to overwrite");

      const forcedOverwrite = spawnSync(
        process.execPath,
        [templateScript, templatePath, "--force"],
        {
          cwd: process.cwd(),
          encoding: "utf8",
        }
      );
      expect(forcedOverwrite.status).toBe(0);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("requires repo-local checks and private evidence for the iOS submission gate", () => {
    const gateScript = path.join(process.cwd(), "scripts/ios-submission-gate.mjs");
    const tempDir = mkdtempSync(path.join(tmpdir(), "beep-ios-submission-gate-"));
    const evidencePath = path.join(tempDir, "ios-submission-evidence.json");

    try {
      const missingEvidence = spawnSync(process.execPath, [gateScript, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(missingEvidence.status).toBe(1);
      expect(missingEvidence.stdout).toContain("iOS release readiness repo-local checks passed");
      expect(missingEvidence.stderr).toContain("missing private evidence file");
      expect(missingEvidence.stderr).toContain("release:ios:evidence:init");

      writeFileSync(evidencePath, JSON.stringify(createValidSubmissionEvidence()), "utf8");
      const pass = spawnSync(process.execPath, [gateScript, evidencePath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(pass.status).toBe(0);
      expect(pass.stdout).toContain("iOS release readiness repo-local checks passed");
      expect(pass.stdout).toContain("iOS submission evidence checks passed");
      expect(pass.stdout).toContain("iOS submission gate passed");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

function createValidSubmissionEvidence() {
  const flows = Object.fromEntries(
    Array.from({ length: 16 }, (_, index) => [
      `IOS-QA-${String(index + 1).padStart(3, "0")}`,
      "pass",
    ])
  );
  const flowEvidenceRefs = Object.fromEntries(
    Array.from({ length: 16 }, (_, index) => {
      const flowId = `IOS-QA-${String(index + 1).padStart(3, "0")}`;
      return [flowId, [`private-release/${flowId.toLowerCase()}-evidence.md`]];
    })
  );

  return {
    build: {
      easBuildUrl: "https://expo.dev/accounts/hypeboyo/projects/beep-get/builds/12345678-1234-4234-8234-123456789abc",
      appVersion: "1.0.0",
      appStoreConnectBuildNumber: "1.0.0 (17)",
      easBuildProfile: "production",
      easChannel: "production",
      testFlightGroup: "Internal QA",
      testerDevices: ["iPhone 15"],
      iosVersions: ["iOS 18.5"],
      backendProject: "dyuzxilukcwiavtvbmci",
      releaseFlags: {
        EXPO_PUBLIC_ENABLE_GOOGLE_AUTH: "0",
        EXPO_PUBLIC_ENABLE_KAKAO_AUTH: "0",
        EXPO_PUBLIC_ENABLE_IAP_STORE: "0",
      },
    },
    publicUrls: {
      privacyUrl: "https://beep-get.app/privacy",
      accountDeletionUrl: "https://beep-get.app/account-deletion",
      supportUrl: "https://beep-get.app/support",
    },
    evidenceRefs: {
      build: ["private-release/testflight-build-summary.png"],
      publicUrls: ["private-release/public-url-checks.png"],
      easEnv: ["private-release/eas-env-names.txt"],
      supabase: ["private-release/supabase-functions-and-audit.txt"],
      appStoreConnect: ["private-release/app-store-connect-metadata.png"],
      testflight: ["private-release/testflight-two-account-flow.md"],
      deletionAudit: ["private-release/deletion-audit-query-result.txt"],
      redaction: ["private-release/redaction-review.md"],
    },
    easEnv: {
      namesPresent: [
        "EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        "EXPO_PUBLIC_PRIVACY_URL",
        "EXPO_PUBLIC_ACCOUNT_DELETION_URL",
        "EXPO_PUBLIC_SUPPORT_URL",
        "EXPO_PUBLIC_ENABLE_GOOGLE_AUTH",
        "EXPO_PUBLIC_ENABLE_KAKAO_AUTH",
        "EXPO_PUBLIC_ENABLE_IAP_STORE",
      ],
      publicValues: {
        EXPO_PUBLIC_SUPABASE_URL: "https://dyuzxilukcwiavtvbmci.supabase.co",
        EXPO_PUBLIC_PRIVACY_URL: "https://beep-get.app/privacy",
        EXPO_PUBLIC_ACCOUNT_DELETION_URL: "https://beep-get.app/account-deletion",
        EXPO_PUBLIC_SUPPORT_URL: "https://beep-get.app/support",
        EXPO_PUBLIC_ENABLE_GOOGLE_AUTH: "0",
        EXPO_PUBLIC_ENABLE_KAKAO_AUTH: "0",
        EXPO_PUBLIC_ENABLE_IAP_STORE: "0",
      },
    },
    supabase: {
      migrationApplied: "20260601120000_apple_auth_tokens.sql",
      functionsDeployed: ["store-apple-revocation-token", "delete-account"],
      appleRevocationSecretNamesPresent: [
        "APPLE_TEAM_ID",
        "APPLE_KEY_ID",
        "APPLE_PRIVATE_KEY",
        "APPLE_TOKEN_CLIENT_ID",
        "APPLE_TOKEN_ENCRYPTION_KEY",
      ],
    },
    appStoreConnect: {
      metadataEntered: true,
      screenshotsEntered: true,
      privacyAnswersEntered: true,
      reviewNotesEntered: true,
      evidenceRefs: {
        metadata: ["private-release/app-store-connect-metadata.png"],
        screenshots: ["private-release/app-store-connect-screenshots.png"],
        privacy: ["private-release/app-store-connect-privacy-answers.png"],
        reviewNotes: ["private-release/app-store-connect-review-notes.png"],
      },
      privacyPolicyUrl: "https://beep-get.app/privacy",
      supportUrl: "https://beep-get.app/support",
    },
    testflight: {
      twoAccounts: true,
      flows,
      flowEvidenceRefs,
      permissionChecks: {
        blinkMicrophonePromptAbsent: true,
        contactsPromptLocalOnly: true,
        evidenceRefs: {
          microphone: ["private-release/microphone-permission-check.md"],
          contacts: ["private-release/contacts-permission-copy.png"],
        },
      },
    },
    deletionAudit: {
      requestId: "11111111-2222-4333-8444-555555555555",
      status: "completed",
      appleRevokeStatus: "completed",
      appleRevokeErrorEmpty: true,
      completedAtPresent: true,
    },
    iap: {
      enabled: false,
    },
    redaction: {
      confirmedNoSecrets: true,
    },
  };
}
