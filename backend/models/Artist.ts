import db from '../config/database';

export interface Artist {
  id: number;
  user_id: number;
  name: string;
  genre: string | null;
  bio: string | null;
  tier: string;
  avatar: string | null;
  created_at: string;
}

export const createArtist = (userId: number, name: string, genre?: string, bio?: string, avatar?: string) => {
  const stmt = db.prepare(`
    INSERT INTO artists (user_id, name, genre, bio, avatar)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, name, genre, bio, avatar);
};

export const getArtistsByUser = (userId: number): Artist[] => {
  return db.prepare('SELECT * FROM artists WHERE user_id = ?').all(userId) as Artist[];
};

export const getArtistById = (id: number): Artist | undefined => {
  return db.prepare('SELECT * FROM artists WHERE id = ?').get(id) as Artist | undefined;
};

export const updateArtist = (id: number, data: Partial<Artist>) => {
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = Object.values(data);
  const stmt = db.prepare(`UPDATE artists SET ${fields} WHERE id = ?`);
  return stmt.run(...values, id);
};

export const deleteArtist = (id: number) => {
  return db.prepare('DELETE FROM artists WHERE id = ?').run(id);
};
