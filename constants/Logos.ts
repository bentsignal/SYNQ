import { Themes } from './Colors';

export const Logos = {
  blue: require('@/assets/logo/logo-blue.png'),
  purple: require('@/assets/logo/logo-purple.png'),
  pink: require('@/assets/logo/logo-pink.png'),
  red: require('@/assets/logo/logo-red.png'),
  orange: require('@/assets/logo/logo-orange.png'),
  yellow: require('@/assets/logo/logo-yellow.png'),
  mint: require('@/assets/logo/logo-mint.png'),
}

export const AppIcons = {
  blue: require('@/assets/appIcons/icon-blue.png'),
  purple: require('@/assets/appIcons/icon-purple.png'),
  pink: require('@/assets/appIcons/icon-pink.png'),
  red: require('@/assets/appIcons/icon-red.png'),
  orange: require('@/assets/appIcons/icon-orange.png'),
  yellow: require('@/assets/appIcons/icon-yellow.png'),
  mint: require('@/assets/appIcons/icon-mint.png'),
}

export const getAppIcon = (id: string) => {
  if (id === Themes.blue || id === 'blue') {
    return AppIcons.blue;
  }
  else if (id === Themes.purple || id === 'purple') {
    return AppIcons.purple;
  }
  else if (id === Themes.pink || id === 'pink') {
    return AppIcons.pink;
  }
  else if (id === Themes.red || id === 'red') {
    return AppIcons.red;
  }
  else if (id === Themes.orange || id === 'orange') {
    return AppIcons.orange;
  }
  else if (id === Themes.yellow || id === 'yellow') {
    return AppIcons.yellow;
  }
  else if (id === Themes.mint || id === 'mint') {
    return AppIcons.mint;
  }
  else {
    return AppIcons.blue;
  }
}

export const getLogo = (id: string) => {
  if (id === Themes.blue || id === 'blue') {
    return Logos.blue;
  }
  else if (id === Themes.purple || id === 'purple') {
    return Logos.purple;
  }
  else if (id === Themes.pink || id === 'pink') {
    return Logos.pink;
  }
  else if (id === Themes.red || id === 'red') {
    return Logos.red;
  }
  else if (id === Themes.orange || id === 'orange') {
    return Logos.orange;
  }
  else if (id === Themes.yellow || id === 'yellow') {
    return Logos.yellow;
  }
  else if (id === Themes.mint || id === 'mint') {
    return Logos.mint;
  }
  else {
    return Logos.blue;
  }
}

export const getIcon = (id: string) => {
  if (id === Themes.blue || id === 'blue') {
    return 'icon-blue';
  }
  else if (id === Themes.purple || id === 'purple') {
    return 'icon-purple';
  }
  else if (id === Themes.pink || id === 'pink') {
    return 'icon-pink';
  }
  else if (id === Themes.red || id === 'red') {
    return 'icon-red';
  }
  else if (id === Themes.orange || id === 'orange') {
    return 'icon-orange';
  }
  else if (id === Themes.yellow || id === 'yellow') {
    return 'icon-yellow';
  }
  else if (id === Themes.mint || id === 'mint') {
    return 'icon-mint';
  }
  else {
    return 'icon-blue';
  }
}