# Reglas Firestore — MatuCourse

Publica estas reglas en Firebase Console → Firestore → Reglas.

Incluye chat en tiempo real, tickets PQR y lectura del perfil del instructor.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users_profile/$(request.auth.uid)).data.is_admin == true;
    }

    match /users_profile/{uid} {
      allow read: if isSignedIn() && (request.auth.uid == uid || resource.data.is_admin == true || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == uid;
      allow update: if isSignedIn() && (request.auth.uid == uid || isAdmin());
    }

    match /enrollments/{id} {
      allow read: if isSignedIn() && (resource.data.user_id == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && (
        request.resource.data.user_id == request.auth.uid || isAdmin()
      );
      allow update, delete: if isAdmin();
    }

    match /courses/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /agenda_sessions/{id} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    match /chat_messages/{msgId} {
      allow read: if isSignedIn() && (
        resource.data.from_user_id == request.auth.uid ||
        resource.data.to_user_id == request.auth.uid ||
        isAdmin()
      );
      allow create: if isSignedIn() &&
        request.resource.data.from_user_id == request.auth.uid &&
        request.resource.data.text is string &&
        request.resource.data.text.size() > 0 &&
        request.resource.data.text.size() <= 2000;
      allow update, delete: if isAdmin();
    }

    match /support_tickets/{ticketId} {
      allow create: if request.resource.data.name is string &&
        request.resource.data.email is string &&
        request.resource.data.subject is string &&
        request.resource.data.message is string &&
        request.resource.data.message.size() >= 10 &&
        request.resource.data.status == 'open';
      allow read: if isAdmin() ||
        (isSignedIn() && resource.data.user_id == request.auth.uid);
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    match /app_config/public {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /app_config/{docId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

## Configurar el instructor para el chat

Opción A — variable de entorno en `.env`:

```
VITE_INSTRUCTOR_USER_ID=tu_firebase_auth_uid
```

Opción B — documento Firestore `app_config/main`:

```json
{
  "instructor_user_id": "tu_firebase_auth_uid"
}
```

Opción C — perfil con `is_admin: true` en `users_profile/{uid}`.

## Índices

Si Firestore pide índices para `support_tickets` ordenado por `created_at`, créalo desde el enlace del error en la consola.
