import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as ArtistModel from '../models/Artist';

export const getMyArtists = (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const artists = ArtistModel.getArtistsByUser(req.user.id);
  res.json(artists);
};

export const getArtist = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const artist = ArtistModel.getArtistById(id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });
  res.json(artist);
};

export const createArtist = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, genre, bio, avatar } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = ArtistModel.createArtist(req.user.id, name, genre, bio, avatar);
  const newArtist = ArtistModel.getArtistById(result.lastInsertRowid as number);
  res.status(201).json(newArtist);
};

export const updateArtist = (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const artist = ArtistModel.getArtistById(id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });

  if (req.user?.role !== 'admin' && artist.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name, genre, bio, avatar, tier } = req.body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (genre !== undefined) data.genre = genre;
  if (bio !== undefined) data.bio = bio;
  if (avatar !== undefined) data.avatar = avatar;
  if (tier !== undefined && req.user?.role === 'admin') data.tier = tier;

  ArtistModel.updateArtist(id, data);
  const updated = ArtistModel.getArtistById(id);
  res.json(updated);
};

export const deleteArtist = (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const artist = ArtistModel.getArtistById(id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });

  if (req.user?.role !== 'admin' && artist.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  ArtistModel.deleteArtist(id);
  res.json({ message: 'Artist deleted' });
};
