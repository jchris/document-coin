

holder.give(doc, recipient)
- acquires keys
- calls subroutines to perform transformations

content.reencrypt(holder, doc.content, recipient)
- decryption
- encryption



history.give(holder, doc.history, recipient)
- holder signs assertion giving to recipient
- places in tree structure

history.verify(doc.history)
