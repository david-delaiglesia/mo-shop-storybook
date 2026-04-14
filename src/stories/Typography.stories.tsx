import type { Meta, StoryObj } from '@storybook/react'

const TypographySample = ({
  className,
  label,
  sampleText = 'The quick brown fox jumps over the lazy dog',
}: {
  className: string
  label: string
  sampleText?: string
}) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
    <code style={{ fontSize: '11px', color: '#888', width: '140px', flexShrink: 0 }}>{label}</code>
    <span className={className}>{sampleText}</span>
  </div>
)

const TypographyPage = () => null

const meta: Meta<typeof TypographyPage> = {
  title: 'Foundations/Typography',
  component: TypographyPage,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TypographyPage>

export const AllStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '8px' }}>Typography Scale</h2>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px' }}>
        All classes from <code>@mercadona/mo.library.shop-ui/styles/typography.css</code>.
        Font: Open Sans. Suffixes: <strong>-b</strong> (bold), <strong>-sb</strong> (semibold 600),
        <strong> -r</strong> (regular), <strong>-c-b</strong> (condensed bold).
      </p>

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Large &mdash; 2.25rem (36px)</h3>
      <TypographySample className="large-b" label=".large-b" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Title 1 &mdash; 1.75rem (28px)</h3>
      <TypographySample className="title1-b" label=".title1-b" />
      <TypographySample className="title1-sb" label=".title1-sb" />
      <TypographySample className="title1-r" label=".title1-r" />
      <TypographySample className="title1-c-b" label=".title1-c-b" sampleText="Condensed bold title" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Title 2 &mdash; 1.375rem (22px)</h3>
      <TypographySample className="title2-b" label=".title2-b" />
      <TypographySample className="title2-r" label=".title2-r" />
      <TypographySample className="title2-c-b" label=".title2-c-b" sampleText="Condensed bold title 2" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Headline 1 &mdash; 1.125rem (18px)</h3>
      <TypographySample className="headline1-b" label=".headline1-b" />
      <TypographySample className="headline1-sb" label=".headline1-sb" />
      <TypographySample className="headline1-r" label=".headline1-r" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Headline 2 &mdash; 1.375rem (22px)</h3>
      <TypographySample className="headline2-c-b" label=".headline2-c-b" sampleText="Condensed bold headline" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Body 1 &mdash; 1rem (16px)</h3>
      <TypographySample className="body1-b" label=".body1-b" />
      <TypographySample className="body1-sb" label=".body1-sb" />
      <TypographySample className="body1-r" label=".body1-r" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Subhead 1 &mdash; 0.875rem (14px)</h3>
      <TypographySample className="subhead1-b" label=".subhead1-b" />
      <TypographySample className="subhead1-sb" label=".subhead1-sb" />
      <TypographySample className="subhead1-r" label=".subhead1-r" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Footnote 1 &mdash; 0.75rem (12px)</h3>
      <TypographySample className="footnote1-b" label=".footnote1-b" />
      <TypographySample className="footnote1-sb" label=".footnote1-sb" />
      <TypographySample className="footnote1-r" label=".footnote1-r" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Caption 1 &mdash; 0.6875rem (11px)</h3>
      <TypographySample className="caption1-sb" label=".caption1-sb" />

      <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#333' }}>Caption 2 &mdash; 0.625rem (10px)</h3>
      <TypographySample className="caption2-b" label=".caption2-b" />
      <TypographySample className="caption2-sb" label=".caption2-sb" />
      <TypographySample className="caption2-r" label=".caption2-r" />
    </div>
  ),
}

export const Fonts: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '32px' }}>Font Families</h2>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#333', marginBottom: '12px' }}>Open Sans (Primary)</h3>
        <p style={{ fontFamily: 'Open Sans', fontWeight: 400, fontSize: '18px', marginBottom: '8px' }}>
          Regular 400 &mdash; The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'Open Sans', fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>
          SemiBold 600 &mdash; The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'Open Sans', fontWeight: 700, fontSize: '18px' }}>
          Bold 700 &mdash; The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#333', marginBottom: '12px' }}>Open Sans Condensed</h3>
        <p style={{ fontFamily: 'Open Sans Condensed', fontWeight: 300, fontSize: '18px', marginBottom: '8px' }}>
          Light 300 &mdash; The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'Open Sans Condensed', fontWeight: 600, fontSize: '18px' }}>
          Bold 600 &mdash; The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: '#333', marginBottom: '12px' }}>Mercadona Sans</h3>
        <p style={{ fontFamily: 'Mercadona Sans', fontWeight: 700, fontSize: '18px' }}>
          Bold 700 &mdash; The quick brown fox jumps over the lazy dog
        </p>
      </div>

      <div>
        <h3 style={{ color: '#333', marginBottom: '12px' }}>PT Serif</h3>
        <p style={{ fontFamily: 'PT Serif', fontWeight: 400, fontSize: '18px', marginBottom: '8px' }}>
          Regular 400 &mdash; The quick brown fox jumps over the lazy dog
        </p>
        <p style={{ fontFamily: 'PT Serif', fontWeight: 700, fontSize: '18px' }}>
          Bold 700 &mdash; The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '24px' }}>Typography in Context</h2>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #eee' }}>
        <p className="title1-b" style={{ marginBottom: '4px' }}>Product Title</p>
        <p className="headline1-r" style={{ marginBottom: '16px', color: '#666' }}>Category name</p>
        <p className="body1-r" style={{ marginBottom: '16px' }}>
          This is body text that describes the product in detail. It uses the regular body style
          for comfortable reading at standard paragraph length.
        </p>
        <p className="subhead1-sb" style={{ marginBottom: '4px' }}>Price: 12,50 &euro;</p>
        <p className="footnote1-r" style={{ color: '#999', marginBottom: '16px' }}>Tax included. Free delivery on orders over 50&euro;.</p>
        <p className="caption2-r" style={{ color: '#bbb' }}>SKU: 12345678 &middot; Last updated: 14/04/2026</p>
      </div>
    </div>
  ),
}
