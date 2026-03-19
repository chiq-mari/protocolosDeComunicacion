from ftplib import FTP

ftp= FTP('192.168.0.104')
ftp.login("user", "12345")

while True:
    cmd = input("ftp> ")

    if (cmd=="ls"):
        ftp.retrlines("LIST")
    
    elif (cmd.startswith(("GET", "get"))):
        filename= cmd.split()[1]
        print (filename)
        with open(filename, "wb") as f:
            ftp.retrbinary(f"RETR {filename}", f.write)

    elif (cmd.startswith(("put", "PUT"))):
        filename= cmd.split()[1]
        with open(filename, "rb") as f:
            ftp.storbinary(f"STOR {filename}", f)

    elif (cmd.startswith(("delete", "DELETE"))):
        filename=cmd.split()[1]
        ftp.delete(filename)

    else:

        if (cmd == "quit"):
            break
        else:
            print("Unknown command")
        
        ftp.quit()
        print("Conexion cerrada exitosamente")
    