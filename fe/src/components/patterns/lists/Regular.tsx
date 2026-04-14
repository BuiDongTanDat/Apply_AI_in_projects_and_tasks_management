export interface RegularListProps {
  items: string[];
  source: string;
  ItemComponent: React.ComponentType;
}

// kỹ thuật "computed property names" trong JavaScript
// để đặt tên thuộc tính động cho đối tượng truyền vào ItemComponent
const myKey = "firstName";
const myValue = "An";

const person = { [myKey]: myValue };

console.log(person, myKey, myValue);

// 'person' bây giờ là: { firstName: "An" }

const RegularList = ({ items, source, ItemComponent }: RegularListProps) => {
  return (
    <div>
      {items.map((item) => (
        <ItemComponent key={item} {...{ [source]: item }} />
      ))}
    </div>
  );
};

export default RegularList;
