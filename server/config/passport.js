const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user exists by Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (user) {
          return done(null, user);
        }

        // 2. Check if user exists by Email (Link accounts)
        // If they registered with email/password before, we just add the Google ID to their account
        const email = profile.emails[0].value;
        user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              googleId: profile.id, 
              isVerified: true // Trust Google that email is real
            }, 
          });
          return done(null, user);
        }

        // 3. Create New User
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            role: "STUDENT", // Default role
            isVerified: true,
          },
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialization (Not strictly needed for JWT-only, but good practice for Passport)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});