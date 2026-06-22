import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAboutSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_about_sections';
  info: {
    displayName: 'About Section';
    icon: 'information';
  };
  attributes: {
    mission: Schema.Attribute.RichText;
    vision: Schema.Attribute.RichText;
    whoWeAre: Schema.Attribute.RichText;
  };
}

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    displayName: 'CTA';
    icon: 'bell';
  };
  attributes: {
    button: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    buttons: Schema.Attribute.Component<'shared.button', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksServicesGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_services_grids';
  info: {
    displayName: 'Services Grid';
    icon: 'grid';
  };
  attributes: {
    services: Schema.Attribute.Component<'shared.service-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksToolkitGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_toolkit_grids';
  info: {
    displayName: 'Toolkit Grid';
    icon: 'apps';
  };
  attributes: {
    ctaButton: Schema.Attribute.Component<'shared.button', false>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
    tools: Schema.Attribute.Component<'shared.tool-item', true>;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_service_items';
  info: {
    displayName: 'Service Item';
    icon: 'briefcase';
  };
  attributes: {
    bulletPoints: Schema.Attribute.RichText;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedToolItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_tool_items';
  info: {
    displayName: 'Tool Item';
    icon: 'wrench';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.about-section': BlocksAboutSection;
      'blocks.cta': BlocksCta;
      'blocks.hero': BlocksHero;
      'blocks.services-grid': BlocksServicesGrid;
      'blocks.toolkit-grid': BlocksToolkitGrid;
      'shared.button': SharedButton;
      'shared.link': SharedLink;
      'shared.service-item': SharedServiceItem;
      'shared.tool-item': SharedToolItem;
    }
  }
}
