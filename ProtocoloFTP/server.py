#  pip install pyftpdlib    library installation
#


#import modules
from pyftpdlib.authorizers import DummyAuthorizer # user auth and permissions for accessing the server
from pyftpdlib.handlers import FTPHandler #core handler that will manage file transfer requests
from pyftpdlib.servers import FTPServer # class that sets up and runs the FTP server

def main():
    # User authorization settings
    authorizer = DummyAuthorizer()  # instance of dummyauthorizer, that will handle user authentication settings (user pass permi)

    # Add user: (username, password, root directory ( which i allow ftp server to access), permissions)
    authorizer.add_user("user", "12345", "C:/ftp_folder", perm="elradfmw")   #permissions to read, append, delete create a file

    # Anonymous user (optional)
    authorizer.add_anonymous("C:/ftp_folder")  # allows user to access without logging in

    # conf FTP handler settings
    handler = FTPHandler  # instamce of ftp handler and assign previous authorizer to it , links handler to authentication system set up
    handler.authorizer = authorizer   

    # conf  Server settings (IP and port)
    server = FTPServer(("0.0.0.0", 21), handler)

    # Maximum connection settings (optional)
    server.max_cons = 256
    server.max_cons_per_ip = 5

    print("FTP Server started. IP: 0.0.0.0, Port: 21")
    # Start the server
    server.serve_forever()

if __name__ == "__main__":
    main()