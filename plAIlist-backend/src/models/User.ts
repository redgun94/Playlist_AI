import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export type AuthProvider = 'local' | 'google' | 'spotify';
// Interface que define la estructura del documento User
export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;           // opcional, SSO users no tienen
  googleId?: string;           // opcional, solo usuarios Google
  spotifyId?: string;          // opcional, solo usuarios Spotify SSO
  authProvider: AuthProvider;  // origen del registro
  picture?: string;            // avatar, Google lo provee automáticamente
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  fullName: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: false,           // ← ya no es required
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  googleId: {
    type: String,
    sparse: true,              // permite múltiples documentos sin este campo
    unique: true
  },
  spotifyId: {
    type: String,
    sparse: true,              // igual que googleId
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'spotify'],
    default: 'local'
  },
  picture: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Solo hashea si hay password y fue modificado
userSchema.pre<IUser>('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  
  const password = this.password; // ← TypeScript ahora sabe que es string, no string | undefined
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  
  const password = this.password; // ← mismo fix
  return await bcrypt.compare(candidatePassword, password);
};

// No devolver la contraseña en las consultas por defecto
userSchema.methods.toJSON = function(this: IUser) {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Crear y exportar el modelo
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;