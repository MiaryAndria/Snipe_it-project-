
                       affichage conditionnel 
                            <div className="form-group" style={{ marginLeft: '24px' }}>
                                <label className="form-label">Libellé traduit</label>
                                <input
                                    className="field-input"
                                    type="text"
                                    value={label[s.id] || ''}        
                                    onChange={(e) => handleTraductionChange(s.id, e.target.value)}
                                    placeholder="Ex : En cours, À faire..."
                                />
                            </div>
                        