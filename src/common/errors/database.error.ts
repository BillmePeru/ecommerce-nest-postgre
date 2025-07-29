export class DatabaseError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  static connectionFailed(details?: Record<string, unknown>): DatabaseError {
    return new DatabaseError(
      'Failed to connect to the database',
      'DB_CONNECTION_FAILED',
      details,
    );
  }

  static queryFailed(details?: Record<string, unknown>): DatabaseError {
    return new DatabaseError(
      'Database query failed',
      'DB_QUERY_FAILED',
      details,
    );
  }

  static entityNotFound(entity: string, id?: number | string): DatabaseError {
    return new DatabaseError(
      `${entity} not found${id ? ` with ID ${id}` : ''}`,
      'DB_ENTITY_NOT_FOUND',
      { entity, id },
    );
  }

  static duplicateEntry(
    entity: string,
    field: string,
    value: string | number,
  ): DatabaseError {
    return new DatabaseError(
      `${entity} with ${field} '${value}' already exists`,
      'DB_DUPLICATE_ENTRY',
      { entity, field, value },
    );
  }

  static foreignKeyViolation(
    entity: string,
    relation: string,
    id: number | string,
  ): DatabaseError {
    return new DatabaseError(
      `Related ${relation} not found for ${entity}`,
      'DB_FOREIGN_KEY_VIOLATION',
      { entity, relation, id },
    );
  }

  static timeout(): DatabaseError {
    return new DatabaseError('Database query timed out', 'DB_QUERY_TIMEOUT');
  }
}
