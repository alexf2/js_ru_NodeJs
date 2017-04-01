            title C(Com)

CSEG SEGMENT PARA 'Code'
     Assume cs:CSEG,ds:CSEG,ss:CSEG,es:CSEG;
     Org 100h
begin:
      Jmp start


Convert PROC far        

	Pushf

        Cmp ah,0
        Jne old

	Popf
        Pushf
	Pushf
        Call DWORD PTR cs:[old16_o]
        Cmp al,'C'
        Jne next        
        Mov al,'‘'
        Jmp return
next:
        Cmp al,'c'
        Jne return        
        Mov al,'á'
return:
        Popf
        Iret

old:    Popf    
        Jmp DWORD PTR cs:[old16_o]

old16_o  DW 0
old16_s  DW 0

Convert ENDP


Int2F_new PROC far
          Pushf
          Cmp ax,00FF00h
          Jne exit_
          Lea si,cs:pass
          Mov ax,cs		
          Mov ds,ax
          Popf	
          Iret
exit_:
          Popf
	  Jmp DWORD PTR cs:[old2F_o]

pass  DB "C_convert 1.0"
len_pass DW 13

old2F_o  DW 0
old2F_s  DW 0

Int2F_new ENDP




start:
        Push ds
	Push es
	Push ds
	Push es

	Mov ax,00FF00h
	Int 2Fh
	Mov ax,cs
	Mov es,ax
	Lea di,cs:pass
	Mov cx,cs:len_pass
	Cld
	REPZ Cmpsb
	Jz already
	Pop es
	Pop ds

        Mov ax,3516h
        Int 21h
        Mov WORD PTR cs:old16_o,bx
        Mov WORD PTR cs:old16_s,es

	Mov ax,352Fh
	Int 21h
	Mov WORD PTR cs:old2F_o,bx
	Mov WORD PTR cs:old2F_s,es

	Pop es
	Pop ds
	Push es
	Push ds

        Mov ax,2516h
        Lea dx,Convert
        Int 21h
	
	Mov ax,252Fh
	Lea dx,Int2F_new
	Int 21h
	
        Pop es
        Pop ds

        Mov ah,9h
        Lea dx,inf
        Int 21h

        Lea dx,start
	Int 27h
already:
	Pop es
	Pop ds
	Pop es
	Pop ds
	Mov ah,9h
	Lea dx,disload_msg
	Int 21h
	Mov ax,4C00h
	Int 21h


disload_msg DB 10,13,"Program is in memory already ! ",10,13,10,7,'$'

inf DB 10,13,"(c) AlexCorp.  The 'C' convert ",10,13,'$'

CSEG ENDS
         END begin

