// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_swift_colonel_america.sql';
import m0001 from './0001_ancient_puppet_master.sql';
import m0002 from './0002_eager_jamie_braddock.sql';
import m0003 from './0003_broken_killmonger.sql';
import m0004 from './0004_mushy_timeslip.sql';
import m0005 from './0005_same_thena.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005
    }
  }
  