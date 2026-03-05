from ftplib import FTP
#py -m pyftpdlib -p 2121 -w
#python -m pyftpdlib -p 21 -w -d C:\Users\maria\Desktop\Univ\Trimestre9\ClasesProtocolos\FTPclass\FTP\ftp_root
servidor = "192.168.1.234"
port = 21 #21  # mismo puerto que pyftpdlib

try:
    conexion = FTP()
    conexion.connect(servidor) #, port)
    # servidor pyftpdlib por defecto: usuario anonymous
    conexion.login("user", "12345")

    print("[+] Conexion establecida corretamente")
    conexion.retrlines("LIST")
    #conexion.quit()
except Exception as e:
    print("[-] No se pudo establecer la conexion al servidor")
    print("Detalle del error:", e)
    exit()

fichero= open("Prueba_servidorFTP.txt", "w")
fichero.writelines("Esta es una prueba de la conexion a un servidor FTP")
fichero.close()

fich= open("Prueba_servidorFTP.txt", "rb")
conexion.storbinary("STOR Prueba_servidorFTP.txt", fich)

##############################################

##############################################
fich.close()