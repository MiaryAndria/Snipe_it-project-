statuses.map(s => (
    <Droppable key={s.id} droppableId={String(s.id)}>
        {(provided) => (
            <div
                ref={provided.innerRef}
                {...provided.droppableProps}
            >
                {ticketFiltrer.map((t,index) => (
                    <Draggable
                        key={t.id}
                        draggableId={String(t.id)}
                        index={index}
                    >
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                ...
                            </div>
                        )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </div>
        )}
    </Droppable>
))