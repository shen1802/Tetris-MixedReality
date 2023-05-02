class user {
  constructor(username, name, surname, age, password, role, institution_id) {
    this.username = username;
    this.name = name;
    this.surname = surname;
    this.age = age;
    this.password = password;
    this.role = role;
    this.institution_id = institution_id;
  }

  getUsername() {
    return this.username;
  }

  getName() {
    return this.name;
  }

  getSurname() {
    return this.surname;
  }

  getAge() {
    return this.age;
  }

  getPassword() {
    return this.password;
  }

  getRole() {
    return this.role;
  }

  getInstitution() {
    return this.institution_id;
  }

  setName(newName) {
    this.name = newName;
  }

  setSurname(newSurname) {
    this.surname = newSurname;
  }

  setAge(newAge) {
    this.age = newAge;
  }

  setPassword(newPassword) {
    this.password = newPassword;
  }

  setRole(newRole) {
    this.role = newRole;
  }

  setInstitution(newInstitutionId) {
    this.institution_id = newInstitutionId;
  }
}

module.exports = user;
