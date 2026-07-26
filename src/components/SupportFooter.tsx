import type { ReactNode } from 'react';

import { useI18n } from '../i18n/context';
import { productName } from '../i18n/translations';
import donations from '../data/donations.json';

const REPOSITORY_URL = 'https://github.com/juanjecilla/OpoProbability';

type Platform = keyof typeof donations;

interface DonationLink {
  platform: Platform;
  name: string;
  icon: ReactNode;
}

const KofiIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 6h11.5a3.5 3.5 0 0 1 0 7H16v.3A4.7 4.7 0 0 1 11.3 18H8.7A4.7 4.7 0 0 1 4 13.3V6.5A.5.5 0 0 1 4.5 6H5z"
      fill="currentColor"
    />
    <path
      d="M9.4 8.2c.9-.9 2.3-.3 2.3.8 0 .8-1 1.6-2.3 2.6-1.3-1-2.3-1.8-2.3-2.6 0-1.1 1.4-1.7 2.3-.8z"
      fill="#FF5E5B"
    />
    <path d="M16 8.5h.7a1.8 1.8 0 0 1 0 3.6H16z" fill="#fff" opacity="0.9" />
  </svg>
);

const CoffeeIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5.2 9h11.6l-.7 6.2A3.5 3.5 0 0 1 12.6 18H9.4a3.5 3.5 0 0 1-3.5-2.8L5.2 9z"
      fill="currentColor"
    />
    <path d="M6 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M9 3.5c-.6.8-.6 1.6 0 2.4M12 3c-.6.9-.6 1.8 0 2.7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const PayPalIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9.3 20l.5-3.1H7.2L9.4 5h5.1c2.7 0 4.4 1.4 3.9 4.3-.5 3-2.6 4.5-5.6 4.5h-1.5L10.7 20H9.3z"
      fill="currentColor"
      opacity="0.55"
    />
    <path
      d="M6.4 21l.5-3.1H4.3L6.5 6h5.1c2.7 0 4.4 1.4 3.9 4.3-.5 3-2.6 4.5-5.6 4.5H8.4L7.8 21H6.4z"
      fill="currentColor"
    />
  </svg>
);

const HeartIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 20.5S4.5 15.6 4.5 10.2C4.5 7.6 6.4 6 8.4 6c1.5 0 2.8.9 3.6 2.2C12.8 6.9 14.1 6 15.6 6c2 0 3.9 1.6 3.9 4.2 0 5.4-7.5 10.3-7.5 10.3z"
      fill="currentColor"
    />
  </svg>
);

const LINKS: DonationLink[] = [
  { platform: 'kofi', name: 'Ko-fi', icon: KofiIcon },
  { platform: 'buyMeACoffee', name: 'Buy Me a Coffee', icon: CoffeeIcon },
  { platform: 'paypal', name: 'PayPal', icon: PayPalIcon },
  { platform: 'githubSponsors', name: 'GitHub Sponsors', icon: HeartIcon },
];

/**
 * Support links plus the colophon. A platform with no URL configured is simply
 * not rendered, so adding or dropping one is a change to `donations.json`.
 */
export function SupportFooter() {
  const { t } = useI18n();

  const available = LINKS.filter((link) => donations[link.platform].length > 0);

  return (
    <footer className="colophon">
      <div className="colophon__intro">
        <h2>
          <span className="colophon__mark" aria-hidden="true">
            §
          </span>
          {t('supportTitle')}
        </h2>
        <p>{t('supportSub')}</p>
      </div>

      {available.length > 0 && (
        <div className="colophon__links">
          {available.map((link) => (
            <a
              key={link.platform}
              className="donate"
              data-platform={link.platform}
              href={donations[link.platform]}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t('supportAria', { name: link.name })}
            >
              <span className="donate__icon">{link.icon}</span>
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      )}

      <p className="colophon__note">
        <em>
          {productName.prefix}
          {productName.suffix}
        </em>{' '}
        · {t('footNote')} ·{' '}
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer noopener">
          GitHub
        </a>{' '}
        · {t('footStack')}
      </p>
    </footer>
  );
}
