import Card from "@/components/elements/Card";
import Section from "@/components/layout/Section";

type ContactLink = {
  label: string;
  handle: string;
  href: string;
  external: boolean;
};

const LINKS: ContactLink[] = [
  {
    label: "Email",
    handle: "hello.kategrant@gmail.com",
    href: "mailto:hello.kategrant@gmail.com",
    external: false,
  },
  {
    label: "LinkedIn",
    handle: "kate-grant-dev",
    href: "https://www.linkedin.com/in/kate-grant-dev",
    external: true,
  },
  {
    label: "GitHub",
    handle: "kate-grant",
    href: "https://github.com/kate-grant",
    external: true,
  },
];

const Arrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    aria-hidden="true"
    className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
  >
    <path
      d="M4 10 L10 4 M5 4 H10 V9"
      stroke="currentColor"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Contact = () => {
  return (
    <Section
      id="contact"
      className="flex items-center justify-center px-4 pb-24 pt-28 sm:px-8"
    >
      <Card size="lg" variant="light">
        <h2 className="text-[clamp(2.5rem,9vw,3.75rem)] font-semibold leading-none tracking-[-0.02em]">
          Say hello.
        </h2>
        <p className="mt-4 text-base leading-relaxed opacity-75">
          I'd love to hear from you.
        </p>

        <ul className="mt-8 list-none border-t border-black/10">
          {LINKS.map((link) => (
            <li key={link.label} className="border-b border-black/10">
              <a
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-md py-4 transition-colors duration-200 hover:text-[#5b8042] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black motion-reduce:transition-none"
              >
                <span className="text-lg font-semibold">{link.label}</span>
                <span className="flex min-w-0 items-center gap-2 text-sm opacity-70 group-hover:opacity-100">
                  <span className="break-all">{link.handle}</span>
                  <Arrow />
                </span>
                {link.external && (
                  <span className="sr-only">(opens in a new tab)</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </Section>
  );
};

export default Contact;
