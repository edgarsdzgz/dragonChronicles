import { setEnemyConfigLoaded } from '$lib/state/config';

export async function loadEnemyConfig() {
  try {
    const res = await fetch('/enemy-config.json');
    if (!res.ok) { 
      setEnemyConfigLoaded(false); 
      throw new Error('enemy-config.json missing'); 
    }
    const cfg = await res.json();
    setEnemyConfigLoaded(true);
    return cfg;
  } catch (error) {
    setEnemyConfigLoaded(false);
    throw error;
  }
}