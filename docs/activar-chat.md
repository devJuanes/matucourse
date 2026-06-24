# Chat estudiante → administrador

No hace falta configurar UID del instructor.

- El **estudiante** envía mensajes con `to_admin: true`.
- Cualquier usuario con `is_admin: true` ve esos mensajes y responde.

## Reglas Firestore

Publica `firestore.rules` en Firebase Console (colección `chat_messages` con `to_admin`).

## Probar

1. Estudiante → **Mensajes** → escribe y envía.
2. Admin → **Mensajes** o **Admin → Mensajes estudiantes** → responde.
