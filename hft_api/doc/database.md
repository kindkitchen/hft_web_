# Database Conventions

## Historical Snapshots (Versioned Entities)

Most business-related entities (not purely relational or technical tables)
should follow the `entity_snapshot[] -> entity` versioning pattern.

### Create Flow

Insert into entity table, copy data into entity_table with extra `head_id`
column, referencing entity table.

### Update Flow

Simply update entity record and then create new snapshot record as in create
flow. Each update creates a new record in entity_snapshot, while the entity
table record acting as the head (similar to a git branch).

### Soft Deletions

To remove something - the only row from `entity` should be really removed but
because `entity_snapshot` is still exists - it is possible to recreate in
future. So all queries are natural, no need in `where operation is null` or
similar filters. [Details how to restore](#when-polymorphism-is-acceptable)

### Indexing Strategy

Only entity tables should have indexes. Snapshots are historical logs — indexes
there are redundant and costly. This is an intentional denormalization for
performance: duplicated data in entity improves read speed, while snapshots
preserve full history.

## Polymorphic Relations

### Core Principle

Avoid polymorphic associations (foreign_id + foreign_type) or json/jsonb
structures. They are not enforced by referential integrity and complicate
cascading updates. Instead, use Table-per-Type (TPT) to model variation cleanly.

#### Example — commenting system:

```graphql
model User {
  id             String          @id @default(uuid())
  comments       UserComment[]
}

model UserComment {
  id             String          @id @default(uuid())
  user           User            @relation(fields: [userId], references: [id])
  userId         String
  photoComments  PhotoComment[]
  videoComments  VideoComment[]
}

model Photo {
  id             String          @id @default(uuid())
  comments       PhotoComment[]
}

model Video {
  id             String          @id @default(uuid())
  comments       VideoComment[]
}

model PhotoComment {
  id              String          @id @default(uuid())
  photo           Photo           @relation(fields: [photoId], references: [id])
  photoId         String
  userComment     UserComment     @relation(fields: [userCommentId], references: [id])
  userCommentId   String
}

model VideoComment {
  id              String          @id @default(uuid())
  video           Video           @relation(fields: [videoId], references: [id])
  videoId         String
  userComment     UserComment     @relation(fields: [userCommentId], references: [id])
  userCommentId   String
}
```

This schema avoids dynamic typing and ensures all relations are explicitly
defined and constrained.

## Some Concrete Conventions

#### Most entity tables should have `created_at` and `updated_at` columns

#### The **entity** / **entity`_snapshot`** tables pair details

- The snapshot table should have `head_id` foreign key that is point to `id` in
  entity table.
- Snapshot can skip `updated_at` column because snapshot itself is something
  immutable
- BUT
- To support historical deletions and restorations - snapshot table should
  contain `deleted_at` and `restored_at` columns
- So delete/restore flow becomes:
  - **Do delete**
  - update last snapshot with `deleted_at = now()`
  - remove entity
  - **To restore**
  - update last snapshot with `restored_at = now()`
  - create new snapshot _(with nulls on deleted/restored_at)_
  - create entity
