svg = ""

length = 50
num = 50
svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"  viewBox="0 0 ' + str(num * 100) + ' ' + str(num * 100) + '" class="SvgFrame"> \n'
for i in range(0, num):
    for j in range(0, num):
        svg += '<path d="M ' + str(i*100) + ' ' + str(j*100 + length / 2) + ' L ' + str(i*100 + length) + ' ' + str(j*100 + length / 2) + '" stroke="#aaa"/> \n'
        svg += '<path d="M ' + str(i*100 + length/2) + ' ' + str(j*100) + ' L ' + str(i*100 + length/2) + ' ' + str(j*100 + length) + '" stroke="#aaa"/> \n'
svg += '</svg>'

f = open('grid.svg', 'w')
f.write(svg)
f.close()