import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Icons } from "../components/shared/icons";

type ProjectInvitationEmailProps = {
  projectName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  siteName: string;
};

export const ProjectInvitationEmail = ({
  projectName,
  inviterName,
  role,
  acceptUrl,
  siteName,
}: ProjectInvitationEmailProps) => {
  const roleDisplay: Record<string, string> = {
    OWNER: "Owner",
    ADMIN: "Administrator",
    MEMBER: "Member",
  };

  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} has invited you to join "{projectName}" on {siteName}
      </Preview>
      <Tailwind>
        <Body className="bg-[#0D0D0D] font-sans">
          <Container className="mx-auto px-6 py-8">
            {/* Header with logo */}
            <Section className="mb-8 text-center">
              <Icons.logo className="m-auto block size-12 fill-[#C0C0C0]" />
            </Section>

            {/* Main content */}
            <Section className="mb-6 rounded-lg bg-[#1A1A1A] p-8">
              <Text className="mb-4 text-2xl font-bold text-white">
                You've been invited!
              </Text>
              <Text className="mb-4 text-base leading-relaxed text-white">
                <strong className="font-semibold text-[#E5E5E5]">
                  {inviterName}
                </strong>{" "}
                has invited you to join their project
              </Text>
              <Text className="mb-6 text-2xl font-semibold text-white">
                {projectName}
              </Text>

              {/* Role badge */}
              <Section className="mb-8 inline-block rounded-full border border-[#3C3C3C] bg-[#252525] px-4 py-2">
                <Text className="m-0 text-sm font-medium text-[#E5E5E5]">
                  Role: {roleDisplay[role]}
                </Text>
              </Section>

              {/* CTA Button - Prominent and visible */}
              <Section className="my-8 text-center">
                <Button
                  href={acceptUrl}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#0D0D0D",
                    padding: "16px 40px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    textDecoration: "none",
                    display: "inline-block",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Join Project
                </Button>
              </Section>

              <Text className="mt-8 text-center text-sm text-[#B0B0B0]">
                This invitation expires in 7 days.
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="my-6 border-t border-[#2C2C2C]" />
            <Section className="text-center">
              <Text className="mb-2 text-xs text-[#737373]">
                This invitation was sent by {inviterName} for the project "
                {projectName}".
              </Text>
              <Text className="mb-2 text-xs text-[#737373]">
                If you didn't expect this invitation, you can safely ignore this
                email.
              </Text>
              <Text className="text-xs text-[#737373]">
                © {new Date().getFullYear()} {siteName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
