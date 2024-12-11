const errors = {
    MISSING_FIRSTUSERNAME: {
        message: 'Missing First Username',
        code: 701
    },
    MISSING_SECONDUSERNAME: {
        message: 'Missing Second Username',
        code: 702
    },
    ALREADY_FOLLOWING: {
        message: 'User Already Following',
        code: 703
    },
    USER_NOT_FOUND: {
        message: 'User Not Found',
        code: 704
    },
    ACCES_DENIED: {
        message: 'You can only message Users you Follow',
        code: 705
    },
    USER_NOT_CONNECTED: {
        message: 'Recipient Not Connected',
        code: 706
    },
    INVALID_MESSAGE_SYNTAX: {
        message: 'Invalid message format. Use "user:messageText"',
        code: 707
    },
    MISSING_USERNAME: {
        message: 'Missing Username',
        code: 708
    },
    MISSING_PASSWORD: {
        message: 'Missing Password',
        code: 709
    }
};

class CustomError extends Error {
    constructor({ message, code }) {
        super(message);
        this.code = code;
    };
};

class MissingFirstUsernameError extends CustomError {
    constructor() {
        super(errors.MISSING_FIRSTUSERNAME);
    };
};

class MissingSecondUsernameError extends CustomError {
    constructor() {
        super(errors.MISSING_SECONDUSERNAME);
    };
};

class AlreadyFollowingError extends CustomError {
    constructor() {
        super(errors.ALREADY_FOLLOWING);
    };
};

class UserNotFoundError extends CustomError {
    constructor() {
        super(errors.USER_NOT_FOUND);
    };
};

class AccessDeniedError extends CustomError {
    constructor() {
        super(errors.ACCES_DENIED);
    };
};

class UserNotConnectedError extends CustomError {
    constructor() {
        super(errors.USER_NOT_CONNECTED);
    };
};

class InvalidMessageSyntaxError extends CustomError {
    constructor() {
        super(errors.INVALID_MESSAGE_SYNTAX);
    };
};

class MissingUsernameError extends CustomError {
    constructor() {
        super(errors.MISSING_USERNAME);
    };
};

class MissingPasswordError extends CustomError {
    constructor() {
        super(errors.MISSING_PASSWORD);
    };
};

module.exports = {
    MissingFirstUsernameError,
    MissingSecondUsernameError,
    AlreadyFollowingError,
    UserNotFoundError,
    AccessDeniedError,
    UserNotConnectedError,
    InvalidMessageSyntaxError,
    MissingPasswordError,
    MissingUsernameError
};
