import { RpcException } from '@nestjs/microservices';

/**
 * Базовый класс для всех HTTP-подобных RPC исключений.
 * Он принимает сообщение и HTTP статус-код.
 * @param message Сообщение об ошибке.
 * @param statusCode HTTP статус-код.
 */
class RpcHttpException extends RpcException {
  constructor(message: string, statusCode: number) {
    super({ message, statusCode });
  }
}

/**
 * Соответствует HTTP 400 Bad Request.
 */
export class RpcBadRequestException extends RpcHttpException {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Соответствует HTTP 401 Unauthorized.
 */
export class RpcUnauthorizedException extends RpcHttpException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Соответствует HTTP 403 Forbidden.
 */
export class RpcForbiddenException extends RpcHttpException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Соответствует HTTP 404 Not Found.
 */
export class RpcNotFoundException extends RpcHttpException {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

/**
 * Соответствует HTTP 409 Conflict.
 * Очень полезен для ошибок типа "ресурс уже существует".
 */
export class RpcConflictException extends RpcHttpException {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Соответствует HTTP 500 Internal Server Error.
 */
export class RpcInternalServerErrorException extends RpcHttpException {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}
