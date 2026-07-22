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

export interface BlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contacts';
  info: {
    displayName: 'Contact';
    icon: 'phone';
  };
  attributes: {
    address: Schema.Attribute.Text;
    email: Schema.Attribute.Email;
    mapEmbedUrl: Schema.Attribute.Text;
    officeHours: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    title: Schema.Attribute.String;
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
    image: Schema.Attribute.Media<'images'>;
    imagePosition: Schema.Attribute.Enumeration<['right', 'left']> &
      Schema.Attribute.DefaultTo<'right'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksEventsList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_events_lists';
  info: {
    description: 'Card grid of events with upcoming/past and search filtering.';
    displayName: 'Events List';
    icon: 'calendar';
  };
  attributes: {
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

export interface BlocksMembersGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_members_grids';
  info: {
    description: 'Grid of member profiles filtered by member type.';
    displayName: 'Members Grid';
    icon: 'user';
  };
  attributes: {
    memberType: Schema.Attribute.Enumeration<['board', 'executive']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'executive'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksPressReleasesList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_press_releases_lists';
  info: {
    description: 'Card grid of press releases with category and search filtering.';
    displayName: 'Press Releases List';
    icon: 'feather';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface BlocksResourcesList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_resources_lists';
  info: {
    description: 'List of resources (documents, links, videos) with view/download actions.';
    displayName: 'Resources List';
    icon: 'file';
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      ['regulations', 'internal', 'external']
    >;
    title: Schema.Attribute.String;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'A free-form rich text content block.';
    displayName: 'Rich Text';
    icon: 'align-left';
  };
  attributes: {
    body: Schema.Attribute.RichText;
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

export interface SharedNavGroup extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_groups';
  info: {
    description: 'Top-level nav item. With child links it renders as a non-clickable dropdown header; without them it is a plain link.';
    displayName: 'Nav Group';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
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
      'blocks.contact': BlocksContact;
      'blocks.cta': BlocksCta;
      'blocks.events-list': BlocksEventsList;
      'blocks.hero': BlocksHero;
      'blocks.members-grid': BlocksMembersGrid;
      'blocks.press-releases-list': BlocksPressReleasesList;
      'blocks.resources-list': BlocksResourcesList;
      'blocks.rich-text': BlocksRichText;
      'blocks.services-grid': BlocksServicesGrid;
      'blocks.toolkit-grid': BlocksToolkitGrid;
      'shared.button': SharedButton;
      'shared.link': SharedLink;
      'shared.nav-group': SharedNavGroup;
      'shared.service-item': SharedServiceItem;
      'shared.tool-item': SharedToolItem;
    }
  }
}
