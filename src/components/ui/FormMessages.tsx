import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

/**
 * Gives a client form the messages of its own namespace(s) only. The root
 * layout sends no messages to the browser (messages={null}); the three
 * pages with forms wrap the form in this instead, so only they load the
 * message formatter and only their part of the catalogue.
 */
export async function FormMessages({
  namespaces,
  children,
}: {
  namespaces: string[];
  children: React.ReactNode;
}) {
  const all = await getMessages();
  const messages = Object.fromEntries(
    namespaces.filter((ns) => ns in all).map((ns) => [ns, all[ns]]),
  );
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
