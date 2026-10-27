# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Clerk authentication

Create a Clerk application and configure it to:

1. Enable the **Native API** in the Clerk Dashboard under **Native applications**.
2. Enable email and password for sign-up and sign-in, and require email verification by code at sign-up.
3. Add the application's publishable key to a local `.env` file:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_REPLACE_ME
   ```

   Start by copying `.env.example` to `.env`, then replace the placeholder with
   the publishable key from your Clerk Dashboard.

The custom screens support email verification, password reset, and email/SMS codes, authenticator codes, backup codes, passkeys, and device-trust verification. Sign-up stores the entered name in the user's `unsafeMetadata.displayName` field so it does not depend on optional name fields being enabled in Clerk. Do not commit `.env` or place a Clerk secret key in any `EXPO_PUBLIC_` variable.

## Tipografía Plus Jakarta Sans

Las variantes `.ttf` se guardan en `assets/fonts` y se cargan al inicio desde
`src/app/_layout.tsx` con `expo-font`. La app espera a que terminen de cargar
antes de ocultar la pantalla de inicio. `expo-font` ya está instalado en este
proyecto; para añadirlo a otro proyecto Expo, ejecuta `npx expo install expo-font`.

Usa las utilidades NativeWind configuradas en `global.css`:

```tsx
<Text className="font-sans">Texto normal</Text>
<Text className="font-sans-bold">Texto en negrita</Text>
```

También puedes elegir una variante en un `StyleSheet`, por ejemplo,
`fontFamily: "sans-semibold"`. Las familias disponibles son `sans-regular`,
`sans-light`, `sans-medium`, `sans-semibold`, `sans-bold` y `sans-extrabold`.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
