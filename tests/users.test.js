const { calculateStudentsAttendance } = require('../routes/users');
const { checkAge, checkEmail, checkNameAndSurname } = require('../routes/auth');

describe(`calculate students' overall attendance`, () => {
  // cases that should fail
  it.each([
    [null, 'Unrecognized Student'],
    [[], 'Unrecognized Student'],
    [24, 'Unrecognized Student'],
    ['string', 'Unrecognized Student']
  ])('should throw error if given %s as an argument', (arg, expected) => {
    expect(function () {
      calculateStudentsAttendance(arg);
    }).toThrow(expected);
  });

  // cases that should succeed
  let expectedSet1 = {
    'john_doe@gmail.com': {
      firstName: 'John',
      lastName: 'Doe',
      attendance: '100.00'
    },
    'jane_doe@gmail.com': {
      firstName: 'Jane',
      lastName: 'Doe',
      attendance: '100.00'
    }
  };

  let expectedSet2 = {
    'john_doe@gmail.com': {
      firstName: 'John',
      lastName: 'Doe',
      attendance: '66.67'
    },
    'jane_doe@gmail.com': {
      firstName: 'Jane',
      lastName: 'Doe',
      attendance: '50.00'
    }
  };

  let expectedSet3 = {
    'john_doe@gmail.com': {
      firstName: 'John',
      lastName: 'Doe',
      attendance: '0.00'
    },
    'jane_doe@gmail.com': {
      firstName: 'Jane',
      lastName: 'Doe',
      attendance: '0.00'
    },
    'carl_nielsen@gmail.com': {
      firstName: 'Carl',
      lastName: 'Nielsen',
      attendance: '0.00'
    }
  };

  it.each([
    [
      'instances with full attendance',
      [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 1
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 1
        }
      ],
      expectedSet1
    ],
    [
      'instances with partial attendance',
      [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@gmail.com',
          classStartDate: new Date('2022-03-03T06:30:00.000Z'),
          isAttending: 0
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 1
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@gmail.com',
          classStartDate: new Date('2022-08-03T06:30:00.000Z'),
          isAttending: 1
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 1
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane_doe@gmail.com',
          classStartDate: new Date('2022-07-03T06:30:00.000Z'),
          isAttending: 0
        }
      ],
      expectedSet2
    ],
    [
      'instances with no attendance',
      [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 0
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane_doe@gmail.com',
          classStartDate: new Date('2022-05-03T06:30:00.000Z'),
          isAttending: 0
        },
        {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane_doe@gmail.com',
          classStartDate: new Date('2022-07-03T06:30:00.000Z'),
          isAttending: 0
        },
        {
          firstName: 'Carl',
          lastName: 'Nielsen',
          email: 'carl_nielsen@gmail.com',
          classStartDate: new Date('2022-07-03T06:30:00.000Z'),
          isAttending: 0
        },
        {
          firstName: 'Carl',
          lastName: 'Nielsen',
          email: 'carl_nielsen@gmail.com',
          classStartDate: new Date('2022-09-03T06:30:00.000Z'),
          isAttending: 0
        }
      ],
      expectedSet3
    ]
  ])(`should return correct attendance for %s`, (description, arg, expected) => {
    expect(calculateStudentsAttendance(arg)).toEqual(expected);
  });
});

describe(`check student age`, () => {
  test('should return true for value within boundary', () => {
    expect(checkAge(new Date('2000-12-03'))).toBe(true);
  });

  test('should return true for valid upper boundary', () => {
    let date = new Date();
    let pastYear = new Date().getFullYear() - 19;
    date.setFullYear(pastYear);

    expect(checkAge(date)).toBe(true);
  });

  test('should return false for invalid upper boundary', () => {
    let date = new Date();
    let pastYear = new Date().getFullYear() - 19;
    date.setFullYear(pastYear);
    date.setDate(date.getDate() + 1);

    expect(checkAge(date)).toBe(false);
  });

  test('should return true for valid string pattern', () => {
    expect(checkAge('2000-03-05')).toBe(true);
  });

  it.each([
    [null, 'Invalid format'],
    [[], 'Invalid format'],
    [7671, 'Invalid format'],
    [{}, 'Invalid format'],
    ['string', 'Invalid string pattern for date'] //string with invalid format,
  ])('should throw invalid format error for %s argument', (arg, expected) => {
    expect(function () {
      checkAge(arg);
    }).toThrow(expected);
  });
});

describe('check user email', () => {
  describe('valid emails', () => {
    it.each([
      ['john.doe@gmail.com', true],
      ['john.doe@gmail.dk', true],
      ['jane-doe@yahoo.dk', true]
    ])('should return true for %s', (arg, expected) => {
      expect(checkEmail(arg)).toBe(expected);
    });
  });

  describe('invalid emails', () => {
    it.each([
      ['john.doe_gmail.com', 'Invalid format'],
      ['john.doe@gmail', 'Invalid format'],
      ['john_doe_<div></div>@gmail.com', 'Invalid format'],
      ['john_doe_;@gmail.com', 'Invalid format'],
      ['@gmail.com', 'Invalid format'],
      ['DROP DATABASE@gmail.com', 'Invalid format']
    ])('should throw error for %s', (arg, expected) => {
      expect(function () {
        checkEmail(arg);
      }).toThrow(expected);
    });
  });
});

describe('check user names', () => {
  describe('valid names', () => {
    it.each([
      ['John', 'Doe'],
      ['Johnathan', 'Thompson Richard'],
      ['Mary Kate', 'Olsen'],
      ['Kate', 'Sue-Williams'],
      ['Brian', "Wells-O'Shaugnessy"],
      ["A-random-name hmm'what-could go'wrong", 'This-is-still-good-right-on-edge'],
      ["A-random-name hmm'what-could go'wrong", 'Mhm but-still-good']
    ])('should return true for %s %s', (firstName, lastName) => {
      expect(checkNameAndSurname(firstName, lastName)).toBe(true);
    });
  });

  describe('invalid names', () => {
    it.each([
      ['John', '', 'Invalid format'],
      ['', 'Doe', 'Invalid format'],
      ['Þór', 'Nielsen', 'Invalid format'],
      [
        "A-random-name hmm'what-could go'wrong",
        'This-time-it-is-absolutely-certain-that-it-is-way-too-long',
        'Expected length exceeded'
      ],
      [
        "A-random-name hmm'what-could go'wrong",
        'This-is-just-right-over-thee-edge',
        'Expected length exceeded'
      ]
    ])('should throw error for %s %s', (firstName, lastName, expected) => {
      expect(function () {
        checkNameAndSurname(firstName, lastName);
      }).toThrow(expected);
    });
  });
});
