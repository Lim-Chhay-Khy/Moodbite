"""
Checks for names, emails and passwords, shared by the register and
profile routes. React checks these too, but the server must check again:
anyone can send requests to the API without using our React app.
"""

import re

# "something@something.something" with no spaces — good enough for a
# student project (real email validation means sending a confirmation email).
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128
MAX_NAME_LENGTH = 50


def clean_email(email):
    """Removes spaces and lowercases, so "Jackie@Example.com " and
    "jackie@example.com" count as the same account."""
    return (email or "").strip().lower()


def find_name_error(name):
    if not isinstance(name, str) or not name.strip():
        return "Name is required."
    if len(name.strip()) > MAX_NAME_LENGTH:
        return f"Name must be {MAX_NAME_LENGTH} characters or fewer."
    return None


def find_email_error(email):
    if not isinstance(email, str) or not EMAIL_PATTERN.match(clean_email(email)):
        return "Please enter a valid email address."
    return None


def find_password_error(password):
    if not isinstance(password, str) or len(password) < MIN_PASSWORD_LENGTH:
        return f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    if len(password) > MAX_PASSWORD_LENGTH:
        return f"Password must be {MAX_PASSWORD_LENGTH} characters or fewer."
    return None
