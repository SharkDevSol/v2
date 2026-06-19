class User {
  final int id;
  final String username;
  final String name;
  final String? email;
  final String role;
  final String userType;
  final String? branchCode;
  final List<String>? permissions;
  final String? token;

  User({
    required this.id,
    required this.username,
    required this.name,
    this.email,
    required this.role,
    required this.userType,
    this.branchCode,
    this.permissions,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json, {String? token}) {
    return User(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      name: json['name'] ?? json['username'] ?? '',
      email: json['email'],
      role: json['role'] ?? 'admin',
      userType: json['userType'] ?? json['user_type'] ?? 'admin',
      branchCode: json['branchCode'] ?? json['branch_code'],
      permissions: json['permissions'] != null
          ? List<String>.from(json['permissions'])
          : null,
      token: token,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'name': name,
        'email': email,
        'role': role,
        'userType': userType,
        'branchCode': branchCode,
        'permissions': permissions,
        'token': token,
      };

  bool get isAdmin => role == 'admin' || userType == 'admin';
  bool get isSuperAdmin => role == 'super_admin';
}
